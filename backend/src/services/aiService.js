import axios from 'axios';
import { config } from '../config/index.js';

class AIService {
  constructor() {
    this.baseUrl = config.ai.baseUrl;
    this.timeout = 30000; // 30 seconds timeout
  }

  async analyzeTicket({ description, requestType, audioBase64 }) {
    try {
      const payload = {
        description,
        requestType,
        ...(audioBase64 && { audioBase64 })
      };

      console.log(`Calling AI service at ${this.baseUrl}/analyze`);
      
      const response = await axios.post(`${this.baseUrl}/analyze`, payload, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Validate response structure
      const { category, priority, summary, entities } = response.data;
      
      if (!category || !priority) {
        throw new Error('AI service returned incomplete analysis');
      }

      return {
        category,
        priority,
        summary: summary || null,
        entities: entities || null
      };
    } catch (error) {
      console.error('AI service error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.warn('AI service unavailable, using fallback analysis');
        return this.getFallbackAnalysis({ description, requestType });
      }
      
      if (error.response) {
        console.error('AI service response error:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      // Return fallback analysis instead of throwing error
      return this.getFallbackAnalysis({ description, requestType });
    }
  }

  // Fallback analysis when AI service is unavailable
  getFallbackAnalysis({ description, requestType }) {
    console.log('Using fallback analysis for ticket');
    
    // Simple rule-based fallback
    let category = requestType;
    let priority = 'Medium';

    // Basic keyword-based priority assignment
    const urgentKeywords = ['urgent', 'critical', 'emergency', 'down', 'outage', 'not working'];
    const highKeywords = ['important', 'asap', 'high priority', 'production'];
    const lowKeywords = ['question', 'inquiry', 'request', 'when possible'];

    const lowerDescription = description.toLowerCase();

    if (urgentKeywords.some(keyword => lowerDescription.includes(keyword))) {
      priority = 'Urgent';
    } else if (highKeywords.some(keyword => lowerDescription.includes(keyword))) {
      priority = 'High';
    } else if (lowKeywords.some(keyword => lowerDescription.includes(keyword))) {
      priority = 'Low';
    }

    // Basic category refinement based on keywords
    const networkKeywords = ['wifi', 'internet', 'connection', 'network', 'bandwidth'];
    const securityKeywords = ['password', 'access', 'login', 'security', 'breach', 'virus'];
    const cloudKeywords = ['cloud', 'backup', 'sync', 'storage', 'drive'];

    if (networkKeywords.some(keyword => lowerDescription.includes(keyword))) {
      category = 'Network';
    } else if (securityKeywords.some(keyword => lowerDescription.includes(keyword))) {
      category = 'Security';
    } else if (cloudKeywords.some(keyword => lowerDescription.includes(keyword))) {
      category = 'Cloud';
    }

    return {
      category,
      priority,
      summary: `${requestType} request - ${description.substring(0, 100)}...`,
      entities: null
    };
  }

  // Health check for AI service
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.error('AI service health check failed:', error.message);
      return false;
    }
  }
}

export default new AIService();