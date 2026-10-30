const express = require('express');
const app = express();

// GET / : welcome text
app.get('/', (req, res) => {
  res.send('Welcome to my Express server!');
});

// GET /about : JSON with name and section
app.get('/about', (req, res) => {
  res.json({
    name: 'Vedh Sathvik',
    section: 'S-15'
  });
});

// GET /time : current date and time
app.get('/time', (req, res) => {
  res.send(`Current date and time: ${new Date()}`);
});

// 404 handler: must come AFTER all other routes
app.use((req, res) => {
  res.status(404).send('404 - Page not found');
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});