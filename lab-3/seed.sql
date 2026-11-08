DROP TABLE IF EXISTS book;

CREATE TABLE book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  author TEXT,
  price INTEGER,
  pages INTEGER
);

INSERT INTO book (title, author, price, pages) VALUES
  ('The Alchemist', 'Paulo Coelho', 299, 208),
  ('Wings of Fire', 'A.P.J. Abdul Kalam', 350, 180),
  ('Atomic Habits', 'James Clear', 499, 320),
  ('The Monk Who Sold His Ferrari', 'Robin Sharma', 275, 198),
  ('Rich Dad Poor Dad', 'Robert Kiyosaki', 399, 336),
  ('Ikigai', 'Hector Garcia', 325, 208),
  ('Think and Grow Rich', 'Napoleon Hill', 250, 238),
  ('Deep Work', 'Cal Newport', 450, 296),
  ('The Power of Habit', 'Charles Duhigg', 380, 371),
  ('Zero to One', 'Peter Thiel', 420, 224);