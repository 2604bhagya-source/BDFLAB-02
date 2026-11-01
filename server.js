const express = require('express');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 3000;
const databasePath = path.join(__dirname, 'books.db');
const initializationSqlPath = path.join(__dirname, 'database', 'init.sql');

app.use(express.json());

let db;

function isValidBookId(id) {
  return /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
}

function validateBookBody(body) {
  const { title, author, price, pages } = body || {};
  const errors = [];

  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push('title must be a non-empty string');
  }
  if (typeof author !== 'string' || author.trim().length === 0) {
    errors.push('author must be a non-empty string');
  }
  if (!Number.isSafeInteger(price) || price <= 0) {
    errors.push('price must be a positive integer');
  }
  if (!Number.isSafeInteger(pages) || pages <= 0) {
    errors.push('pages must be a positive integer');
  }

  return errors;
}

function validateIdParameter(req, res, next) {
  if (!isValidBookId(req.params.id)) {
    return res.status(400).json({ error: 'Book ID must be a positive integer' });
  }
  return next();
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

app.get('/books', asyncRoute(async (req, res) => {
  const books = await db.all('SELECT id, title, author, price, pages FROM book ORDER BY id');
  res.status(200).json(books);
}));

app.get('/books/:id', validateIdParameter, asyncRoute(async (req, res) => {
  const book = await db.get(
    'SELECT id, title, author, price, pages FROM book WHERE id = ?',
    Number(req.params.id)
  );
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  return res.status(200).json(book);
}));

app.post('/books', asyncRoute(async (req, res) => {
  const errors = validateBookBody(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid book details', details: errors });
  }

  const { title, author, price, pages } = req.body;
  const result = await db.run(
    'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)',
    title.trim(),
    author.trim(),
    price,
    pages
  );
  const book = await db.get(
    'SELECT id, title, author, price, pages FROM book WHERE id = ?',
    result.lastID
  );
  return res.status(201).json({ message: 'Book added successfully', book });
}));

app.put('/books/:id', validateIdParameter, asyncRoute(async (req, res) => {
  const errors = validateBookBody(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid book details', details: errors });
  }

  const { title, author, price, pages } = req.body;
  const result = await db.run(
    'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?',
    title.trim(),
    author.trim(),
    price,
    pages,
    Number(req.params.id)
  );
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Book not found' });
  }
  return res.status(200).json({ message: 'Book updated successfully' });
}));

app.delete('/books/:id', validateIdParameter, asyncRoute(async (req, res) => {
  const result = await db.run('DELETE FROM book WHERE id = ?', Number(req.params.id));
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Book not found' });
  }
  return res.status(200).json({ message: 'Book deleted successfully' });
}));

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Request body must contain valid JSON' });
  }
  console.error('Request failed:', err);
  return res.status(500).json({ error: 'An internal server error occurred' });
});

async function initializeDBAndServer() {
  try {
    db = await sqlite.open({
      filename: databasePath,
      driver: sqlite3.Database
    });
    const initializationSql = await fs.readFile(initializationSqlPath, 'utf8');
    await db.exec(initializationSql);

    const server = app.listen(PORT, () => {
      console.log(`Books API server is running on port ${PORT}`);
      console.log(`SQLite database connected: ${databasePath}`);
    });
    server.on('error', (error) => {
      console.error(`Unable to start the HTTP server on port ${PORT}:`, error);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error('Unable to initialize the SQLite database or start the server:', error);
    process.exitCode = 1;
  }
}

initializeDBAndServer();
