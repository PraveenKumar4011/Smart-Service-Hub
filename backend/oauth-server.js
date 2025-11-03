import express from 'express';
import axios from 'axios';
import fs from 'fs';

const app = express();
const PORT = 3001;

const CLIENT_ID = '1000.DC6KPBUK80K8EEGL4C4J4L00KM60GF';
const CLIENT_SECRET = '09d4caed45638363103b3b0726f8e6bd24c0d4e0a4';
const REDIRECT_URI = 'http://localhost:3001/api/auth/callback';
const SCOPE = 'ZohoCreator.form.CREATE';

console.log('\n🚀 Zoho OAuth Server Started\n');
console.log('📋 Step 1: Open this URL in your browser:\n');
console.log(`https://accounts.zoho.in/oauth/v2/auth?scope=${SCOPE}&client_id=${CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${REDIRECT_URI}`);
console.log('\n⏳ Waiting for authorization...\n');

app.get('/api/auth/callback', async (req, res) => {
  const code = req.query.code;
  
  if (!code) {
    res.send('❌ No authorization code received!');
    return;
  }

  console.log('✅ Authorization code received!');
  console.log('🔄 Exchanging for access token and refresh token...\n');

  try {
    const response = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
      params: {
        code: code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      }
    });

    const { access_token, refresh_token, expires_in } = response.data;

    console.log('✅ SUCCESS! Tokens received:\n');
    console.log('Access Token:', access_token);
    console.log('\n📌 REFRESH TOKEN (Save this!):');
    console.log(refresh_token);
    console.log('\nExpires in:', expires_in, 'seconds');

    // Update .env file
    const envPath = '.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent = envContent.replace(/ZOHOCREATOR_API_KEY=.*/, `ZOHOCREATOR_API_KEY=${access_token}`);
    envContent = envContent.replace(/ZOHO_REFRESH_TOKEN=.*/, `ZOHO_REFRESH_TOKEN=${refresh_token}`);
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ .env file updated!\n');
    console.log('🎯 You can now close this server (Ctrl+C) and test your Zoho integration!\n');

    res.send(`
      <html>
        <body style="font-family: Arial; padding: 50px; text-align: center;">
          <h1 style="color: green;">✅ Success!</h1>
          <p>Tokens received and saved to .env file</p>
          <p><strong>Refresh Token:</strong></p>
          <code style="background: #f4f4f4; padding: 10px; display: block; margin: 20px;">${refresh_token}</code>
          <p>You can close this window and the server now.</p>
        </body>
      </html>
    `);

    setTimeout(() => {
      console.log('🛑 Shutting down server...');
      process.exit(0);
    }, 3000);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.send(`❌ Error: ${error.response?.data?.error || error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Server listening on http://localhost:${PORT}`);
});
