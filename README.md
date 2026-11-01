# Lab 2: SQLite Database and CRUD Routes

## College details

- **Institution:** Aurora Higher Education and Research Academy
- **Course:** B.Tech CSE (Generative AI)
- **Year / Term:** II Year, Term II
- **Subject:** Backend Development Fundamentals
- **Faculty:** Joel Prashanth D
- **Student:** Bhagyasri
- **Registration number:** ____________________
- **Section:** ____________________

## Objective

Build an Express.js backend connected to SQLite and implement all five CRUD operations (create, read, update, and delete) for book records. The API validates inputs and uses parameterized SQL for values supplied by clients.

## Technologies

Node.js, Express.js, SQLite, `sqlite`, `sqlite3`, Nodemon, and Postman.

## Project structure

```text
lab-02/
├── .gitignore
├── Lab2-Books-CRUD.postman_collection.json
├── README.md
├── books.db
├── package-lock.json
├── package.json
├── server.js
├── database/
│   └── init.sql
└── screenshots/
    └── .gitkeep
```

`books.db` is created and seeded when the server starts if the database is empty. The SQL schema and ten initial records are also included in `database/init.sql`. The initialization uses `INSERT OR IGNORE`, so subsequent starts do not duplicate the seeded IDs.

## Installation and execution

Run these commands from the `lab-02` directory:

```powershell
npm install
npm start
```

For development with automatic restarts:

```powershell
npm run dev
```

The server listens on `process.env.PORT` when configured by the host, or port `3000` for local development. Stop the server with Ctrl+C.

## SQLite database

The database file is `books.db`; it contains the `book` table:

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | Primary key, auto-increment |
| `title` | TEXT | Not null |
| `author` | TEXT | Not null |
| `price` | INTEGER | Not null |
| `pages` | INTEGER | Not null |

### SQLite CLI commands

If the SQLite command-line program is installed, open a PowerShell terminal in `lab-02` and run:

```text
sqlite3
.open books.db
.tables
.schema book
SELECT * FROM book;
INSERT INTO book (title, author, price, pages) VALUES ('CLI Sample', 'Sample Author', 199, 150);
UPDATE book SET price = 220 WHERE title = 'CLI Sample';
DELETE FROM book WHERE title = 'CLI Sample';
.quit
```

The `sqlite3` CLI was not installed in this workspace, so the results below were queried directly from the actual `books.db` using the project's SQLite driver. They are database outputs, not a fabricated CLI transcript. The CLI commands above are ready to run when SQLite CLI is available.

```text
TABLES: book
SCHEMA: CREATE TABLE book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER NOT NULL
)
COUNT BEFORE: 10
INSERT CHANGES: 1
INSERT ROW: {"id":12,"title":"CLI Sample","author":"Sample Author","price":199,"pages":150}
UPDATE CHANGES: 1 PRICE: 220
DELETE CHANGES: 1
COUNT AFTER ROLLBACK: 10
```

Those INSERT, UPDATE, and DELETE examples were executed inside a transaction and rolled back after verification, so the submitted database still contains only its ten sample records. In a normal SQLite CLI session, the three statements modify the database permanently unless you explicitly roll them back.

## API endpoints

Base URL for local testing: `http://localhost:3000`. For deployment, use the URL assigned by Render instead.

| Method | Endpoint | Purpose | Success status |
|---|---|---|---|
| GET | `/books` | Return all books | 200 |
| GET | `/books/:id` | Return one book by ID | 200 |
| POST | `/books` | Create a book | 201 |
| PUT | `/books/:id` | Replace a book's details | 200 |
| DELETE | `/books/:id` | Delete a book | 200 |

Unknown IDs return 404. Invalid IDs and invalid book bodies return 400. A book body must have non-empty `title` and `author` strings and positive integer `price` and `pages` values. POST and PUT send JSON with `Content-Type: application/json`.

### Postman instructions

1. Start the server using `npm start`.
2. In Postman choose **Import**, then select `Lab2-Books-CRUD.postman_collection.json`.
3. Keep the collection's `baseUrl` variable as `http://localhost:3000` for local use. Set it to the deployed service URL to test Render.
4. Send requests in this order: get all, get by ID, create, update, delete. The create request stores its new ID in the collection's `bookId` variable, which the update and delete requests use.

| Request | Method and URL | Headers | Body | Expected response |
|---|---|---|---|---|
| Get all books | `GET {{baseUrl}}/books` | None | None | 200; JSON array |
| Get book by ID | `GET {{baseUrl}}/books/1` | None | None | 200; book object, or 404 if absent |
| Create a book | `POST {{baseUrl}}/books` | `Content-Type: application/json` | `{"title":"The Alchemist","author":"Paulo Coelho","price":350,"pages":208}` | 201; success message and created book |
| Update a book | `PUT {{baseUrl}}/books/{{bookId}}` | `Content-Type: application/json` | `{"title":"Updated Book Title","author":"Updated Author","price":450,"pages":300}` | 200; success message |
| Delete a book | `DELETE {{baseUrl}}/books/{{bookId}}` | None | None | 200; success message, or 404 if absent |

### Verified local API run

The following output was captured from the running server and real HTTP requests in this workspace. The test record was removed at the end, leaving the ten seed records in the database.

```text
Terminal:
> lab-2-books-crud@1.0.0 start
> node server.js
Books API server is running on port 3000
SQLite database connected: ...\lab-02\books.db

GET /books [200] — initial response:
[
  {"id":1,"title":"The Alchemist","author":"Paulo Coelho","price":350,"pages":208},
  {"id":2,"title":"Wings of Fire","author":"A. P. J. Abdul Kalam","price":299,"pages":180},
  {"id":3,"title":"The Guide","author":"R. K. Narayan","price":250,"pages":220},
  {"id":4,"title":"Train to Pakistan","author":"Khushwant Singh","price":325,"pages":192},
  {"id":5,"title":"The White Tiger","author":"Aravind Adiga","price":399,"pages":321},
  {"id":6,"title":"Pride and Prejudice","author":"Jane Austen","price":275,"pages":432},
  {"id":7,"title":"1984","author":"George Orwell","price":299,"pages":328},
  {"id":8,"title":"The Hobbit","author":"J. R. R. Tolkien","price":450,"pages":310},
  {"id":9,"title":"To Kill a Mockingbird","author":"Harper Lee","price":375,"pages":336},
  {"id":10,"title":"The Great Gatsby","author":"F. Scott Fitzgerald","price":225,"pages":180}
]
GET /books/1 [200]:
{"id":1,"title":"The Alchemist","author":"Paulo Coelho","price":350,"pages":208}
POST /books [201]:
{"message":"Book added successfully","book":{"id":11,"title":"Lab 2 CRUD Verification","author":"Backend Lab","price":199,"pages":150}}
GET /books after POST: 11 records; created record present=True
PUT /books/11 [200]:
{"message":"Book updated successfully"}
GET /books/11 after PUT [200]:
{"id":11,"title":"Updated Lab 2 Book","author":"Updated Backend Lab","price":249,"pages":175}
DELETE /books/11 [200]:
{"message":"Book deleted successfully"}
GET /books after DELETE: 10 records; deleted record present=False
Database records before CRUD: 10
Database records after CRUD: 10 (seed records 1 through 10; verification record 11 is absent)
GET /books/9999 [404]: {"error":"Book not found"}
GET /books/0 [400]: {"error":"Book ID must be a positive integer"}
POST invalid book [400]: {"error":"Invalid book details","details":["title must be a non-empty string","price must be a positive integer"]}

Nodemon development run:
> lab-2-books-crud@1.0.0 dev
> nodemon server.js
[nodemon] starting `node server.js`
Books API server is running on port 3001
GET http://localhost:3001/books: HTTP 200; 10 books
```

After DELETE, the actual database rows were the same ten records returned by the initial GET `/books` response above (IDs 1–10); the temporary ID 11 no longer existed.

## Screenshot evidence

No screenshots are fabricated. To capture genuine evidence, start the API, send each request in Postman, and save screenshots showing the request URL, response status, JSON body, and terminal output into `screenshots/`, for example:

- `screenshots/get-all-books.png`
- `screenshots/create-book.png`
- `screenshots/update-book.png`
- `screenshots/delete-book.png`

## Render deployment

Create a Web Service connected to the repository and configure:

- **Runtime:** Node
- **Root Directory:** `lab-02`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

Render provides the `PORT` environment variable; the server listens on that port. After deployment, set the Postman `baseUrl` variable to the Render service's HTTPS URL.

- **Deployment URL:** `<add your Render service URL here>`

If deployment fails, check that the root directory is `lab-02`, dependencies install successfully, the start command is `npm start`, and the service logs show successful database initialization. SQLite stores its database in the deployed service's filesystem; deployments with ephemeral filesystems may not retain writes across restarts/redeploys. Configure a persistent disk if the chosen Render plan supports it and durable SQLite writes are required.

## Problems faced and solutions

- **Database may not exist on first run:** the startup initialization opens `books.db`, applies the table schema, and inserts the initial records.
- **Repeated initialization could duplicate examples:** seeded records have fixed IDs and `INSERT OR IGNORE` keeps initialization repeatable.
- **Unsafe SQL input:** user-supplied values are passed through `?` placeholders rather than concatenated into SQL.
- **Invalid or missing request data:** the API validates IDs and all required book fields before writing to the database.

## Short answers

1. **Why use `await` for database calls?** To wait for the asynchronous query to finish before using its result or sending the response.
2. **What is SQL injection?** An attack where untrusted input changes the meaning of a SQL statement.
3. **How do placeholders prevent SQL injection?** The database treats bound values as data, not executable SQL syntax.
4. **When is PUT used instead of POST?** PUT updates a known resource, while POST commonly creates a resource in a collection.
5. **What is SQLite?** A lightweight relational database stored in a local file, without a separate database server process.
6. **What is CRUD?** Create, Read, Update, and Delete—the four basic data operations.
7. **What is Nodemon?** A development tool that restarts a Node.js process when source files change.
8. **What is a primary key?** A column (or set of columns) that uniquely identifies each row.
9. **What is an API endpoint?** A URL and HTTP method through which a client accesses an API operation.
10. **How do SQLite and MySQL differ?** SQLite is embedded and file-based; MySQL is a client-server database system commonly used for multi-user networked applications.

## Repository

Existing GitHub repository: [BDFLAB-01](https://github.com/2604bhagya-source/BDFLAB-01). Lab 2 is isolated in the `lab-02` directory; do not overwrite Lab 1 files.

To push the folder from a local clone of that repository, run from the repository root and substitute the branch you use for `<branch>`:

```powershell
git add lab-02
git commit -m "Add Lab 2 SQLite books CRUD API"
git push origin <branch>
```
