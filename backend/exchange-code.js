import axios from 'axios';

const code = '1000.3089bb38ee350486d66ae853cf7e34f5.21c84174ff75108dbf595427f290182a';
const clientId = '1000.LHPK4ZN8P81N05WRKAH6JN11I0UBXU';
const clientSecret = 'd17a2690ce6f2ed43cf6117a038b0e2f548a2e7cee';

console.log('🔄 Exchanging authorization code for tokens...\n');

// For Self Client, the generated code IS the access token
// We need to use it directly to test
console.log('✅ The code you generated IS your access token!');
console.log('\nAccess Token:');
console.log(code);
console.log('\n⚠️  Note: Self Client codes from "Generate Code" are short-lived access tokens.');
console.log('They expire quickly (3-10 minutes).');
console.log('\nFor production, you need a REFRESH TOKEN.');
console.log('\nLet me test if this token works with Zoho Creator...\n');

const testPayload = {
  data: {
    Name: 'Test User',
    Email: 'test@example.com',
    Request_Type: 'Network',
    Description: 'Testing with Self Client token',
    Category: 'Network',
    Priority: 'Medium'
  }
};

axios.post(
  'https://creator.zoho.in/api/v2.1/pk.08497121/smart-service-hub/form/Service_Hub_Form',
  testPayload,
  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Zoho-oauthtoken ${code}`
    },
    timeout: 15000
  }
)
  .then(response => {
    console.log('✅ SUCCESS! Response received\n');
    console.log('Full Response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n');
    
    if (response.data.access_token) {
      console.log('Access Token:', response.data.access_token);
      console.log('\n📌 REFRESH TOKEN (SAVE THIS):');
      console.log(response.data.refresh_token);
      console.log('\nExpires in:', response.data.expires_in, 'seconds');
    }
  })
  .catch(error => {
    console.error('❌ ERROR:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  });
