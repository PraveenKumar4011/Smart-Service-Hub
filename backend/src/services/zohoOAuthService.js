import axios from 'axios';
import { config } from '../config/index.js';

class ZohoOAuthService {
  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID;
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET;
    this.refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    this.accessToken = process.env.ZOHOCREATOR_API_KEY; // Initial token
    this.tokenUrl = 'https://accounts.zoho.in/oauth/v2/token';
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshAccessToken() {
    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      console.warn('Zoho OAuth credentials not configured for token refresh');
      return null;
    }

    try {
      console.log('🔄 Refreshing Zoho access token...');
      
      const response = await axios.post(this.tokenUrl, null, {
        params: {
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token'
        }
      });

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        console.log('✅ Zoho access token refreshed successfully');
        return this.accessToken;
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to refresh Zoho access token:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Get current access token, refresh if needed
   */
  async getAccessToken() {
    // If we have a valid token, return it
    if (this.accessToken) {
      return this.accessToken;
    }

    // Try to refresh
    return await this.refreshAccessToken();
  }

  /**
   * Make an API call with automatic token refresh on 401
   */
  async makeAuthenticatedRequest(url, method = 'POST', data = null) {
    let token = await this.getAccessToken();
    
    if (!token) {
      throw new Error('No valid Zoho access token available');
    }

    try {
      const response = await axios({
        method,
        url,
        data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Zoho-oauthtoken ${token}`
        },
        timeout: 15000
      });

      return response;
    } catch (error) {
      // If 401, try to refresh token and retry once
      if (error.response?.status === 401) {
        console.log('🔄 Token expired, refreshing...');
        token = await this.refreshAccessToken();
        
        if (!token) {
          throw new Error('Failed to refresh Zoho access token');
        }

        // Retry the request with new token
        const retryResponse = await axios({
          method,
          url,
          data,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Zoho-oauthtoken ${token}`
          },
          timeout: 15000
        });

        return retryResponse;
      }

      throw error;
    }
  }
}

export default new ZohoOAuthService();
