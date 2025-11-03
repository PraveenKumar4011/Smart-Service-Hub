import axios from 'axios';

const testTicket = {
  name: "Test User",
  email: "test@example.com",
  requestType: "Technical Support",
  description: "This is a test ticket to verify Zoho integration"
};

console.log('🧪 Testing ticket submission...\n');
console.log('Payload:', JSON.stringify(testTicket, null, 2));

axios.post('http://localhost:3001/api/tickets', testTicket)
  .then(response => {
    console.log('\n✅ Ticket created successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  })
  .catch(error => {
    console.error('\n❌ Error:', error.response?.data || error.message);
  });
