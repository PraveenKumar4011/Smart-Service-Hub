# Zoho OAuth Token Setup Guide

## Problem
The "Generate Code" tab in Self Client creates short-lived tokens (3-10 min) that aren't suitable for production.

## Solution: Get a Refresh Token

### Method 1: Use Zoho Creator API Key (Recommended - Simplest)

1. Go to your Zoho Creator app: https://creator.zoho.in/
2. Open your app: `smart-service-hub`
3. Click **Settings** (gear icon) → **Integrations**
4. Look for **API** section
5. Generate an **All Time Token** or **API Key**
6. Copy it and add to `.env`:
   ```env
   ZOHOCREATOR_API_KEY=<your_permanent_api_key>
   ```

### Method 2: OAuth with Refresh Token (More Complex)

Since Self Client doesn't easily provide refresh tokens through the UI, you need to:

1. **Set up redirect URI** in your Self Client at https://api-console.zoho.in/
   - Add redirect URI: `http://localhost:8080/callback`

2. **Run the OAuth flow**:
   ```bash
   cd backend
   node oauth-flow-server.js
   ```

3. **Visit the authorization URL** shown in the console

4. **Approve** the app

5. **Copy the refresh token** from the console output

6. **Add to .env**:
   ```env
   ZOHO_REFRESH_TOKEN=<your_refresh_token>
   ```

## Current Status

Your Self Client:
- Client ID: `1000.LHPK4ZN8P81N05WRKAH6JN11I0UBXU`
- Client Secret: `d17a2690ce6f2ed43cf6117a038b0e2f548a2e7cee`

## Recommendation

**Use Method 1 (API Key)** - it's simpler and doesn't expire.
