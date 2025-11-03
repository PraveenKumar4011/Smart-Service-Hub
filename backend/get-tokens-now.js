import axios from 'axios';
import fs from 'fs';

const code = '1000.ff056f62de6df21f8c480e3b058d6b8f.9ab748574208903ad88d4a88e4196b52';
const clientId = '1000.DC6KPBUK80K8EEGL4C4J4L00KM60GF';
const clientSecret = '09d4caed45638363103b3b0726f8e6bd24c0d4e0a4';
const redirectUri = 'http://localhost:3001/api/auth/callback';

console.log('🔄 Exchanging authorization code for tokens...\n');

axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
  params: {
    code: code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  }
})
  .then(response => {
    console.log('Full response:', JSON.stringify(response.data, null, 2));
    
    const { access_token, refresh_token, expires_in } = response.data;

    console.log('\n✅ SUCCESS! Tokens received:\n');
    console.log('Access Token:', access_token);
    console.log('\n📌 REFRESH TOKEN (SAVE THIS!):');
    console.log(refresh_token);
    console.log('\nExpires in:', expires_in, 'seconds\n');

    // Update .env file
    const envPath = '.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent = envContent.replace(/ZOHOCREATOR_API_KEY=.*/, `ZOHOCREATOR_API_KEY=${access_token}`);
    envContent = envContent.replace(/ZOHO_REFRESH_TOKEN=.*/, `ZOHO_REFRESH_TOKEN=${refresh_token}`);
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ .env file updated successfully!\n');
    console.log('🚀 Now you can test your Zoho integration!\n');
    console.log('Run: node test-zoho-direct.js\n');
  })
  .catch(error => {
    console.error('❌ ERROR:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  });
