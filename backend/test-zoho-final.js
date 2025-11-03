import zohoOAuthService from './src/services/zohoOAuthService.js';
import dotenv from 'dotenv';

dotenv.config();

const testPayload = {
  data: {
    Name: {
      first_name: "Jane",
      last_name: "Doe"
    },
    Email: "jane@example.com",
    Request_Type: "Network",
    Description: "Testing final integration",
    Category: "Network",
    Priority: "Medium",
    Summary: "Network request - Testing final integration"
  }
};

console.log('🧪 Testing Zoho Creator API with OAuth\n');
console.log('Payload:', JSON.stringify(testPayload, null, 2));
console.log('\n📤 Sending to Zoho...\n');

const url = process.env.ZOHOCREATOR_URL;

zohoOAuthService.makeAuthenticatedRequest(url, 'POST', testPayload)
  .then(response => {
    console.log('✅ SUCCESS!\n');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n🎉 Check your Zoho Creator report now!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ FAILED!\n');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  });
