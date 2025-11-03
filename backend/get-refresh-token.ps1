# Zoho OAuth - Get Refresh Token
Write-Host "🔍 Zoho OAuth Token Generator`n" -ForegroundColor Cyan

$clientId = "1000.LHPK4ZN8P81N05WRKAH6JN11I0UBXU"
$clientSecret = "d17a2690ce6f2ed43cf6117a038b0e2f548a2e7cee"

# Ask for redirect URI
Write-Host "Common redirect URIs:"
Write-Host "  1. http://localhost"
Write-Host "  2. https://www.zoho.com/creator"
Write-Host "  3. Custom URI`n"
$choice = Read-Host "Select (1, 2, or 3)"

switch ($choice) {
    "1" { $redirectUri = "http://localhost" }
    "2" { $redirectUri = "https://www.zoho.com/creator" }
    "3" { $redirectUri = Read-Host "Enter your redirect URI" }
    default { $redirectUri = "http://localhost" }
}

Write-Host "`n📋 Use this URL to get authorization code:`n" -ForegroundColor Yellow
$authUrl = "https://accounts.zoho.in/oauth/v2/auth?scope=ZohoCreator.form.CREATE&client_id=$clientId&response_type=code&access_type=offline&redirect_uri=$redirectUri"
Write-Host $authUrl -ForegroundColor Green
Write-Host "`n⚠️  Make sure '$redirectUri' is registered in your Zoho Self Client!`n" -ForegroundColor Yellow

$authCode = Read-Host "Enter the authorization code from the URL"

Write-Host "`n🔄 Exchanging authorization code for tokens...`n"

$body = @{
    code = $authCode
    client_id = $clientId
    client_secret = $clientSecret
    redirect_uri = $redirectUri
    grant_type = "authorization_code"
}

try {
    $response = Invoke-RestMethod -Uri "https://accounts.zoho.in/oauth/v2/token" -Method Post -Body $body
    
    Write-Host "✅ SUCCESS! Tokens generated`n" -ForegroundColor Green
    Write-Host "Access Token: $($response.access_token)`n"
    Write-Host "Refresh Token: $($response.refresh_token)`n" -ForegroundColor Yellow
    Write-Host "⚠️  SAVE THE REFRESH TOKEN - You'll need it in your .env file!`n" -ForegroundColor Yellow
    
    # Update .env file
    Write-Host "📝 Updating .env file...`n"
    
    $envContent = Get-Content .env -Raw
    $envContent = $envContent -replace 'ZOHO_CLIENT_ID=.*', "ZOHO_CLIENT_ID=$clientId"
    $envContent = $envContent -replace 'ZOHO_CLIENT_SECRET=.*', "ZOHO_CLIENT_SECRET=$clientSecret"
    $envContent = $envContent -replace 'ZOHO_REFRESH_TOKEN=.*', "ZOHO_REFRESH_TOKEN=$($response.refresh_token)"
    $envContent = $envContent -replace 'ZOHOCREATOR_API_KEY=.*', "ZOHOCREATOR_API_KEY=$($response.access_token)"
    
    Set-Content -Path .env -Value $envContent
    
    Write-Host "✅ .env file updated successfully!`n" -ForegroundColor Green
    Write-Host "🚀 You can now restart your backend server`n"
    
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nResponse: $($_.ErrorDetails.Message)"
}
