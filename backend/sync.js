const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

axios.post(`${API_URL}/api/pfe/sync`, {}, {
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 300000
})
.then(response => {
  console.log('Sync completed successfully');
  if (response.data.processed !== undefined) {
    console.log('Processed:', response.data.processed);
  }
  if (response.data.errors !== undefined) {
    console.log('Errors:', response.data.errors);  
  }
})
.catch(error => {
  console.error('Sync failed:', error.message);
  process.exit(1);
});
