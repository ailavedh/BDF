const express = require('express')
const path = require('path')
const { open } = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json()) // lets Express read JSON request bodies

app.get('/', (request, response) => {
  response.send(
    'Books API is running. Try <a href="/books/">/books/</a>'
  )
})

const dbPath = path.join(__dirname, 'books.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// 1. GET all books
app.get('/books/', async (request, response) => {
  const books = await db.all('SELECT * FROM book ORDER BY id;')
  response.send(books)
})

// 2. GET one book
app.get('/books/:bookId/', async (request, response) => {
  const { bookId } = request.params
  const book = await db.get('SELECT * FROM book WHERE id = ?;', [bookId])
  if (book === undefined) {
    response.status(404).send({ error: 'Book not found' })
  } else {
    response.send(book)
  }
})

// 3. POST add a book
app.post('/books/', async (request, response) => {
  const { title, author, price, pages } = request.body
  const result = await db.run(
    'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);',
    [title, author, price, pages]
  )
  response.status(201).send({ bookId: result.lastID })
})

// 4. PUT update a book
app.put('/books/:bookId/', async (request, response) => {
  const { bookId } = request.params
  const { title, author, price, pages } = request.body
  const result = await db.run(
    'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;',
    [title, author, price, pages, bookId]
  )
  if (result.changes === 0) {
    response.status(404).send({ error: 'Book not found' })
  } else {
    response.send({ message: 'Book updated' })
  }
})

// 5. DELETE a book
app.delete('/books/:bookId/', async (request, response) => {
  const { bookId } = request.params
  const result = await db.run('DELETE FROM book WHERE id = ?;', [bookId])
  if (result.changes === 0) {
    response.status(404).send({ error: 'Book not found' })
  } else {
    response.send({ message: 'Book deleted' })
  }
})