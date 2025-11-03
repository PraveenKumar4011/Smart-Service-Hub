import axios from 'axios';

const testTicket = {
  name: "John Doe",
  email: "john.doe@example.com",
  requestType: "Network",
  description: "Testing Zoho integration - this is a test ticket to verify data submission"
};

console.log('🧪 Testing Zoho ticket submission...\n');
console.log('Test Payload:');
console.log(JSON.stringify(testTicket, null, 2));
console.log('\n📤 Sending to backend API...\n');

axios.post('http://localhost:3001/api/tickets', testTicket)
  .then(response => {
    console.log('✅ SUCCESS! Ticket created');
    console.log('\nResponse:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n🎯 Check backend logs for Zoho submission details');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ ERROR:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  });
