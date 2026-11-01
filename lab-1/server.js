const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

// Middleware to log the route and status code to the terminal
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${req.method}] ${req.originalUrl} -> Status: ${res.statusCode}`)
  })
  next()
})

// 1. GET / -> Welcome text
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Express Server!')
})

// 2. GET /about -> JSON with your details
app.get('/about', (req, res) => {
  res.status(200).json({
    name: 'A. Vedh Sathvik',
    section: 'S-15',
  })
})

// 3. GET /time -> Current date and time
app.get('/time', (req, res) => {
  const now = new Date()
  res.status(200).json({
    iso: now.toISOString(),
    local: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  })
})

// 4. 404 route for any other path (must be last)
app.use((req, res) => {
  res.status(404).send('404 Not Found')
})

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`)
})

module.exports = app