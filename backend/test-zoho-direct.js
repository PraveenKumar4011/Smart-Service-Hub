import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const zohoUrl = process.env.ZOHOCREATOR_URL;
const zohoApiKey = process.env.ZOHOCREATOR_API_KEY;

console.log('🔍 Testing Direct Zoho API Connection\n');
console.log('URL:', zohoUrl);
console.log('API Key:', zohoApiKey ? `${zohoApiKey.substring(0, 20)}...` : 'NOT SET');
console.log('\n');

const testPayload = {
  data: {
    Name: "Test User",
    Email: "test@example.com",
    Request_Type: "Network",
    Description: "Direct API test - checking Zoho integration",
    Category: "Network",
    Priority: "Medium",
    AI_Summary: "Test ticket for Zoho integration verification"
  }
};

console.log('📤 Sending payload to Zoho:');
console.log(JSON.stringify(testPayload, null, 2));
console.log('\n');

axios.post(zohoUrl, testPayload, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Zoho-oauthtoken ${zohoApiKey}`
  },
  timeout: 15000
})
  .then(response => {
    console.log('✅ SUCCESS! Zoho accepted the data\n');
    console.log('Status:', response.status);
    console.log('Response:');
    console.log(JSON.stringify(response.data, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ ZOHO API ERROR:\n');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Response Data:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from Zoho');
      console.error('Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  });
