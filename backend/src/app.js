const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://pfe-library-project.vercel.app',
  'https://pfe-library-project-mjrk61laz-yassine-boussabats-projects.vercel.app',
  /^https:\/\/pfe-library-project.*\.vercel\.app$/
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
