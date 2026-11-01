CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER NOT NULL
);

INSERT OR IGNORE INTO book (id, title, author, price, pages) VALUES
  (1, 'The Alchemist', 'Paulo Coelho', 350, 208),
  (2, 'Wings of Fire', 'A. P. J. Abdul Kalam', 299, 180),
  (3, 'The Guide', 'R. K. Narayan', 250, 220),
  (4, 'Train to Pakistan', 'Khushwant Singh', 325, 192),
  (5, 'The White Tiger', 'Aravind Adiga', 399, 321),
  (6, 'Pride and Prejudice', 'Jane Austen', 275, 432),
  (7, '1984', 'George Orwell', 299, 328),
  (8, 'The Hobbit', 'J. R. R. Tolkien', 450, 310),
  (9, 'To Kill a Mockingbird', 'Harper Lee', 375, 336),
  (10, 'The Great Gatsby', 'F. Scott Fitzgerald', 225, 180);
