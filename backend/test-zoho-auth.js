import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const zohoUrl = process.env.ZOHOCREATOR_URL;
const zohoApiKey = process.env.ZOHOCREATOR_API_KEY;

console.log('🔍 Testing Multiple Zoho Auth Methods\n');
console.log('URL:', zohoUrl);
console.log('API Key:', zohoApiKey ? `${zohoApiKey.substring(0, 20)}...` : 'NOT SET');
console.log('\n');

const testPayload = {
  data: {
    Name: "Test User",
    Email: "test@example.com",
    Request_Type: "Network",
    Description: "Testing authentication methods",
    Category: "Network",
    Priority: "Medium"
  }
};

// Method 1: Authorization header with Zoho-oauthtoken
console.log('📤 Method 1: Authorization: Zoho-oauthtoken\n');
axios.post(zohoUrl, testPayload, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Zoho-oauthtoken ${zohoApiKey}`
  },
  timeout: 15000
})
  .then(response => {
    console.log('✅ Method 1 SUCCESS!');
    console.log(JSON.stringify(response.data, null, 2));
    process.exit(0);
  })
  .catch(error1 => {
    console.error('❌ Method 1 Failed:', error1.response?.status, error1.response?.data?.description);
    
    // Method 2: Query parameter
    console.log('\n📤 Method 2: Query parameter ?authtoken=\n');
    axios.post(`${zohoUrl}?authtoken=${zohoApiKey}`, testPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    })
      .then(response => {
        console.log('✅ Method 2 SUCCESS!');
        console.log(JSON.stringify(response.data, null, 2));
        process.exit(0);
      })
      .catch(error2 => {
        console.error('❌ Method 2 Failed:', error2.response?.status, error2.response?.data?.description);
        
        // Method 3: Different header format
        console.log('\n📤 Method 3: Authorization: Bearer\n');
        axios.post(zohoUrl, testPayload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${zohoApiKey}`
          },
          timeout: 15000
        })
          .then(response => {
            console.log('✅ Method 3 SUCCESS!');
            console.log(JSON.stringify(response.data, null, 2));
            process.exit(0);
          })
          .catch(error3 => {
            console.error('❌ Method 3 Failed:', error3.response?.status, error3.response?.data?.description);
            console.log('\n❌ All authentication methods failed!');
            console.log('\n💡 You need to:');
            console.log('   1. Generate an access token that hasn\'t expired');
            console.log('   2. Or set up a Self Client in Zoho API Console');
            console.log('   3. Or use a refresh token to get a new access token');
            console.log('\n📚 Visit: https://api-console.zoho.in/');
            process.exit(1);
          });
      });
  });
