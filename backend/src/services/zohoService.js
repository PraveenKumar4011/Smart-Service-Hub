import axios from 'axios';
import { config } from '../config/index.js';
import zohoOAuthService from './zohoOAuthService.js';

class ZohoService {
  constructor() {
    this.url = config.zoho.url;
    this.apiKey = config.zoho.apiKey;
    this.timeout = 15000; // 15 seconds timeout
  }

  async createTicket(ticketData) {
    if (!this.url || !this.apiKey) {
      console.warn('Zoho credentials not configured, skipping Zoho integration');
      return { success: false, reason: 'Not configured' };
    }

    try {
      // Prepare payload for Zoho Creator v2.1 API (requires 'data' wrapper)
      // Split name into first and last name
      const nameParts = ticketData.name.split(' ');
      const firstName = nameParts[0] || ticketData.name;
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const zohoPayload = {
        data: {
          Name: {
            first_name: firstName,
            last_name: lastName
          },
          Email: ticketData.email,
          Request_Type: ticketData.requestType,
          Description: ticketData.description,
          Category: ticketData.category || ticketData.requestType,
          Priority: ticketData.priority || 'Medium',
          Summary: ticketData.summary || `${ticketData.requestType} request from ${ticketData.name}`,
          Entities: ticketData.entities ? JSON.stringify(ticketData.entities) : null
        }
      };

      console.log(`Sending ticket to Zoho Creator at ${this.url}`);
      console.log('Payload:', JSON.stringify(zohoPayload, null, 2));
      
      // Use OAuth service for automatic token refresh
      const response = await zohoOAuthService.makeAuthenticatedRequest(
        this.url,
        'POST',
        zohoPayload
      );

      console.log('Zoho response:', response.status, response.data);

      return {
        success: true,
        zohoId: response.data?.data?.ID || response.data?.ID || response.data?.id,
        response: response.data
      };

    } catch (error) {
      console.error('Zoho service error:', error.message);
      
      if (error.response) {
        console.error('Zoho response error:', {
          status: error.response.status,
          data: error.response.data
        });
        
        return {
          success: false,
          error: error.response.data?.message || 'Zoho API error',
          status: error.response.status
        };
      }
      
      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: 'Zoho service unavailable',
          code: error.code
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTicket(zohoId) {
    if (!this.url || !this.apiKey) {
      return { success: false, reason: 'Not configured' };
    }

    try {
      const response = await axios.get(`${this.url}/${zohoId}`, {
        timeout: this.timeout,
        headers: {
          'x-api-key': this.apiKey
        }
      });

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('Zoho get ticket error:', error.message);
      
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  async updateTicket(zohoId, updateData) {
    if (!this.url || !this.apiKey) {
      return { success: false, reason: 'Not configured' };
    }

    try {
      const zohoPayload = { data: updateData };
      
      const response = await axios.put(`${this.url}/${zohoId}`, zohoPayload, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        }
      });

      return {
        success: true,
        response: response.data
      };

    } catch (error) {
      console.error('Zoho update ticket error:', error.message);
      
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  // Health check for Zoho service
  async healthCheck() {
    if (!this.url || !this.apiKey) {
      return false;
    }

    try {
      // Try to make a simple request to check connectivity
      const response = await axios.head(this.url.replace('/tickets', ''), {
        timeout: 5000,
        headers: {
          'x-api-key': this.apiKey
        }
      });
      return response.status < 400;
    } catch (error) {
      console.error('Zoho health check failed:', error.message);
      return false;
    }
  }

  isConfigured() {
    return !!(this.url && this.apiKey);
  }
}

export default new ZohoService();