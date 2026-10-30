const express = require('express')
const path = require('path')
const { open } = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'books.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// Home route (so the live link does not show "Cannot GET /")
app.get('/', (request, response) => {
  response.send('Books API is running. Try /books/')
})

// 1. GET all books
app.get('/books/', async (request, response) => {
  try {
    const books = await db.all('SELECT * FROM book ORDER BY id;')
    response.status(200).send(books)
  } catch (error) {
    response.status(500).send({ error: error.message })
  }
})

// 2. GET one book
app.get('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params
    const book = await db.get('SELECT * FROM book WHERE id = ?;', [bookId])
    if (book === undefined) {
      response.status(404).send({ error: 'Book not found' })
    } else {
      response.status(200).send(book)
    }
  } catch (error) {
    response.status(500).send({ error: error.message })
  }
})

// 3. POST add a book
app.post('/books/', async (request, response) => {
  try {
    const { title, author, price, pages } = request.body || {}
    if (!title || !author || price === undefined || pages === undefined) {
      response
        .status(400)
        .send({ error: 'title, author, price and pages are required' })
      return
    }
    const result = await db.run(
      'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);',
      [title, author, price, pages]
    )
    response.status(201).send({ bookId: result.lastID })
  } catch (error) {
    response.status(500).send({ error: error.message })
  }
})

// 4. PUT update a book
app.put('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params
    const { title, author, price, pages } = request.body || {}
    if (!title || !author || price === undefined || pages === undefined) {
      response
        .status(400)
        .send({ error: 'title, author, price and pages are required' })
      return
    }
    const result = await db.run(
      'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;',
      [title, author, price, pages, bookId]
    )
    if (result.changes === 0) {
      response.status(404).send({ error: 'Book not found' })
    } else {
      response.status(200).send({ message: 'Book updated' })
    }
  } catch (error) {
    response.status(500).send({ error: error.message })
  }
})

// 5. DELETE a book
app.delete('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params
    const result = await db.run('DELETE FROM book WHERE id = ?;', [bookId])
    if (result.changes === 0) {
      response.status(404).send({ error: 'Book not found' })
    } else {
      response.status(200).send({ message: 'Book deleted' })
    }
  } catch (error) {
    response.status(500).send({ error: error.message })
  }
})

module.exports = app