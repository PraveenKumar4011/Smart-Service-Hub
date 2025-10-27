import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/server.js';

// Mock the AI and Zoho services
jest.unstable_mockModule('../src/services/aiService.js', () => ({
  default: {
    analyzeTicket: jest.fn(),
    healthCheck: jest.fn().mockResolvedValue(true)
  }
}));

jest.unstable_mockModule('../src/services/zohoService.js', () => ({
  default: {
    createTicket: jest.fn(),
    healthCheck: jest.fn().mockResolvedValue(true),
    isConfigured: jest.fn().mockReturnValue(true)
  }
}));

const aiService = (await import('../src/services/aiService.js')).default;
const zohoService = (await import('../src/services/zohoService.js')).default;

describe('Ticket API', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Default AI service mock response
    aiService.analyzeTicket.mockResolvedValue({
      category: 'Network',
      priority: 'Medium',
      summary: 'Network connectivity issue',
      entities: null
    });
    
    // Default Zoho service mock response
    zohoService.createTicket.mockResolvedValue({
      success: true,
      zohoId: 'ZOHO123'
    });
  });

  describe('POST /api/tickets', () => {
    const validTicketData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      requestType: 'Network',
      description: 'Having trouble with internet connection in the office'
    };

    it('should create a ticket successfully', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .send(validTicketData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: expect.any(Number),
          name: validTicketData.name,
          email: validTicketData.email,
          requestType: validTicketData.requestType,
          description: validTicketData.description,
          category: 'Network',
          priority: 'Medium'
        }),
        aiAnalysis: expect.objectContaining({
          category: 'Network',
          priority: 'Medium'
        })
      });

      expect(aiService.analyzeTicket).toHaveBeenCalledWith({
        description: validTicketData.description,
        requestType: validTicketData.requestType,
        audioBase64: undefined
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: 'Name is required'
          }),
          expect.objectContaining({
            field: 'email',
            message: 'Email is required'
          }),
          expect.objectContaining({
            field: 'requestType',
            message: 'Request type is required'
          }),
          expect.objectContaining({
            field: 'description',
            message: 'Description is required'
          })
        ])
      });
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .send({
          ...validTicketData,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: 'Invalid email format'
        })
      );
    });

    it('should validate request type enum', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .send({
          ...validTicketData,
          requestType: 'InvalidType'
        })
        .expect(400);

      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'requestType',
          message: 'Request type must be one of: Network, Security, Cloud, General'
        })
      );
    });

    it('should handle AI service errors gracefully', async () => {
      aiService.analyzeTicket.mockRejectedValue(new Error('AI service down'));

      const response = await request(app)
        .post('/api/tickets')
        .send(validTicketData)
        .expect(201);

      expect(response.body.success).toBe(true);
      // Should still create ticket even if AI fails
      expect(response.body.data).toBeDefined();
    });

    it('should include audio data when provided', async () => {
      const ticketWithAudio = {
        ...validTicketData,
        audioBase64: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp...'
      };

      await request(app)
        .post('/api/tickets')
        .send(ticketWithAudio)
        .expect(201);

      expect(aiService.analyzeTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          audioBase64: ticketWithAudio.audioBase64
        })
      );
    });

    it('should sanitize input data', async () => {
      const maliciousData = {
        ...validTicketData,
        name: '<script>alert(\"xss\")</script>John Doe',
        description: 'Normal description <img src=x onerror=alert(1)>'
      };

      const response = await request(app)
        .post('/api/tickets')
        .send(maliciousData)
        .expect(201);

      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.description).toBe('Normal description');
    });
  });

  describe('GET /api/tickets', () => {
    it('should return all tickets', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        count: expect.any(Number)
      });
    });

    it('should support category filtering', async () => {
      await request(app)
        .get('/api/tickets?category=Network')
        .expect(200);
    });

    it('should support priority filtering', async () => {
      await request(app)
        .get('/api/tickets?priority=High')
        .expect(200);
    });

    it('should support search query', async () => {
      await request(app)
        .get('/api/tickets?q=network%20issue')
        .expect(200);
    });

    it('should validate limit parameter', async () => {
      const response = await request(app)
        .get('/api/tickets?limit=999')
        .expect(400);

      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'limit',
          message: 'Limit must be between 1 and 100'
        })
      );
    });
  });

  describe('GET /api/tickets/:id', () => {
    it('should return 404 for non-existent ticket', async () => {
      const response = await request(app)
        .get('/api/tickets/999999')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Ticket not found',
        id: 999999
      });
    });

    it('should validate ticket ID parameter', async () => {
      const response = await request(app)
        .get('/api/tickets/invalid-id')
        .expect(400);

      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'id',
          message: 'Ticket ID must be a positive integer'
        })
      );
    });
  });

  describe('GET /api/tickets/stats/summary', () => {
    it('should return ticket statistics', async () => {
      const response = await request(app)
        .get('/api/tickets/stats/summary')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          total: expect.any(Number),
          byCategory: expect.any(Array),
          byPriority: expect.any(Array)
        })
      });
    });
  });

  describe('GET /api/tickets/health/status', () => {
    it('should return service health status', async () => {
      const response = await request(app)
        .get('/api/tickets/health/status')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        services: expect.objectContaining({
          database: true,
          ai: expect.any(Boolean),
          zoho: expect.objectContaining({
            configured: expect.any(Boolean),
            healthy: expect.any(Boolean)
          })
        }),
        timestamp: expect.any(String)
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Route not found'
      });
    });

    it('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });
});