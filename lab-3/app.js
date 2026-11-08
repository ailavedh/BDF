const express = require('express')
const path = require('path')
const { open } = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'books.db')
let db = null

// Column names cannot be ? placeholders, so ORDER BY only accepts this fixed list
const SORTABLE_COLUMNS = ['id', 'title', 'author', 'price', 'pages']

const isWholeNumber = (value) => /^\d+$/.test(String(value))
const isPositiveId = (value) => /^[1-9]\d*$/.test(String(value))
const isNumeric = (value) =>
  String(value).trim() !== '' && Number.isFinite(Number(value))

// Every error uses the same shape: { "message": "..." }
const sendError = (response, status, message) =>
  response.status(status).json({ message })

// Returns an error message, or null when the book data is valid
const validateBook = (body) => {
  const { title, author, price, pages } = body || {}

  if (typeof title !== 'string' || title.trim() === '') {
    return 'title is required and must be non-empty text'
  }
  if (typeof author !== 'string' || author.trim() === '') {
    return 'author is required and must be non-empty text'
  }
  if (
    (typeof price !== 'number' && typeof price !== 'string') ||
    !isNumeric(price) ||
    Number(price) < 0
  ) {
    return 'price is required and must be a number of 0 or more'
  }
  if (pages !== undefined && pages !== null && !isWholeNumber(pages)) {
    return 'pages must be a whole number when given'
  }
  return null
}

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

// Home route
app.get('/', (request, response) => {
  response.status(200).json({ message: 'Books API is running. Try /books/' })
})

// 1. GET /books/ : search, sort, price range, paging
app.get('/books/', async (request, response) => {
  const {
    search_q = '',
    order_by = 'id',
    order = 'ASC',
    limit = '10',
    offset = '0',
    min_price,
    max_price,
  } = request.query

  const direction = String(order).toUpperCase()

  if (!SORTABLE_COLUMNS.includes(order_by)) {
    return sendError(
      response,
      400,
      `order_by must be one of: ${SORTABLE_COLUMNS.join(', ')}`
    )
  }
  if (direction !== 'ASC' && direction !== 'DESC') {
    return sendError(response, 400, 'order must be ASC or DESC')
  }
  if (!isWholeNumber(limit) || Number(limit) < 1) {
    return sendError(response, 400, 'limit must be a whole number of 1 or more')
  }
  if (!isWholeNumber(offset)) {
    return sendError(response, 400, 'offset must be a whole number of 0 or more')
  }
  if (min_price !== undefined && !isNumeric(min_price)) {
    return sendError(response, 400, 'min_price must be a number')
  }
  if (max_price !== undefined && !isNumeric(max_price)) {
    return sendError(response, 400, 'max_price must be a number')
  }
  if (
    min_price !== undefined &&
    max_price !== undefined &&
    Number(min_price) > Number(max_price)
  ) {
    return sendError(response, 400, 'min_price cannot be greater than max_price')
  }

  const conditions = ['title LIKE ?']
  const params = [`%${search_q}%`]

  if (min_price !== undefined) {
    conditions.push('price >= ?')
    params.push(Number(min_price))
  }
  if (max_price !== undefined) {
    conditions.push('price <= ?')
    params.push(Number(max_price))
  }

  const sql = `
    SELECT * FROM book
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${order_by} ${direction}, id ASC
    LIMIT ? OFFSET ?;
  `
  const books = await db.all(sql, [...params, Number(limit), Number(offset)])
  response.status(200).json(books)
})

// 2. GET /books/:bookId/ : one book
app.get('/books/:bookId/', async (request, response) => {
  const { bookId } = request.params
  if (!isPositiveId(bookId)) {
    return sendError(response, 400, 'bookId must be a positive whole number')
  }
  const book = await db.get('SELECT * FROM book WHERE id = ?;', [bookId])
  if (book === undefined) {
    return sendError(response, 404, 'Book not found')
  }
  response.status(200).json(book)
})

// 3. POST /books/ : create
app.post('/books/', async (request, response) => {
  const message = validateBook(request.body)
  if (message) {
    return sendError(response, 400, message)
  }
  const { title, author, price, pages } = request.body
  const result = await db.run(
    'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);',
    [
      title.trim(),
      author.trim(),
      Number(price),
      pages === undefined || pages === null ? null : Number(pages),
    ]
  )
  response.status(201).json({ message: 'Book created', bookId: result.lastID })
})

// 4. PUT /books/:bookId/ : update
app.put('/books/:bookId/', async (request, response) => {
  const { bookId } = request.params
  if (!isPositiveId(bookId)) {
    return sendError(response, 400, 'bookId must be a positive whole number')
  }
  const message = validateBook(request.body)
  if (message) {
    return sendError(response, 400, message)
  }
  const { title, author, price, pages } = request.body
  const result = await db.run(
    'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;',
    [
      title.trim(),
      author.trim(),
      Number(price),
      pages === undefined || pages === null ? null : Number(pages),
      bookId,
    ]
  )
  if (result.changes === 0) {
    return sendError(response, 404, 'Book not found')
  }
  response.status(200).json({ message: 'Book updated' })
})

// 5. DELETE /books/:bookId/ : delete
app.delete('/books/:bookId/', async (request, response) => {
  const { bookId } = request.params
  if (!isPositiveId(bookId)) {
    return sendError(response, 400, 'bookId must be a positive whole number')
  }
  const result = await db.run('DELETE FROM book WHERE id = ?;', [bookId])
  if (result.changes === 0) {
    return sendError(response, 404, 'Book not found')
  }
  response.status(200).json({ message: 'Book deleted' })
})

// Unknown route
app.use((request, response) => {
  sendError(response, 404, 'Route not found')
})

// Error handler: bad JSON bodies and unexpected errors
app.use((error, request, response, next) => {
  if (error.type === 'entity.parse.failed') {
    return sendError(response, 400, 'Request body is not valid JSON')
  }
  console.error(error)
  sendError(response, 500, 'Internal server error')
})

module.exports = app