console.log('Starting server.js execution...');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Start the server
console.log('Environment Variables:', process.env);
console.log('Server is attempting to start...');
console.log(`Attempting to bind server to port ${PORT}...`);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log('Server binding complete.');
});
