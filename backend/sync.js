const axios = require('axios');

console.log('🔄 Starting Google Drive sync...');
console.log('📡 Using endpoint: http://localhost:5000/api/pfe/sync');

axios.post('http://localhost:5000/api/pfe/sync', {}, {
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 300000 // 5 minutes timeout
})
.then(response => {
  console.log('✅ Sync completed successfully!');
  console.log('📊 Results:');
  
  if (response.data.processed !== undefined) {
    console.log('  - Processed:', response.data.processed);
  }
  if (response.data.errors !== undefined) {
    console.log('  - Errors:', response.data.errors);  
  }
  if (response.data.message) {
    console.log('  - Message:', response.data.message);
  }
  
  console.log('📋 Full response:', JSON.stringify(response.data, null, 2));
})
.catch(error => {
  console.error('❌ Sync failed!');
  
  if (error.code === 'ECONNREFUSED') {
    console.error('🔌 Cannot connect to backend server');
    console.error('💡 Make sure your backend is running: npm run dev');
  } else if (error.response) {
    console.error('📊 HTTP Error:', error.response.status);
    console.error('📝 Message:', error.response.data?.message || error.response.statusText);
    
    if (error.response.status === 404) {
      console.error('💡 Route not found. Tried: /api/pfe/sync');
    } else if (error.response.status === 500) {
      console.error('💡 Server error. Check your backend logs for details.');
    }
  } else if (error.request) {
    console.error('🌐 Network error - no response from server');
  } else {
    console.error('🐛 Error:', error.message);
  }
  
  process.exit(1);
});
