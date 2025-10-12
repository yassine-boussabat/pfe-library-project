const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/thumbnails', express.static(
  path.join(process.cwd(), '..', 'frontend', 'public', 'thumbnails')
));

app.get('/', (req, res) => {
  res.json({ 
    message: 'PFE Library API is running!',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
