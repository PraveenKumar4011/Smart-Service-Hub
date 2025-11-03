import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { 
  validateTicketCreation, 
  validateGetTickets, 
  validateTicketId, 
  handleValidationErrors,
  sanitizeInput 
} from '../middleware/validation.js';
import TicketDatabase from '../database/tickets.js';
import aiService from '../services/aiService.js';
import zohoService from '../services/zohoService.js';

const router = express.Router();
const ticketDb = new TicketDatabase();

// POST /api/tickets - Create a new ticket
router.post('/', 
  sanitizeInput,
  validateTicketCreation,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { name, email, requestType, description, audioBase64 } = req.body;

    console.log(`Creating ticket for ${name} (${email}) - ${requestType}`);

    // Get AI analysis
    console.log('Getting AI analysis...');
    const aiAnalysis = await aiService.analyzeTicket({
      description,
      requestType,
      audioBase64
    });

    console.log('AI analysis result:', aiAnalysis);

    // Prepare ticket data
    const ticketData = {
      name,
      email,
      requestType,
      description,
      audioBase64,
      category: aiAnalysis.category,
      priority: aiAnalysis.priority,
      summary: aiAnalysis.summary,
      entities: aiAnalysis.entities
    };

    // Save to database
    const savedTicket = ticketDb.create(ticketData);
    console.log(`Ticket created with ID: ${savedTicket.id}`);

    // Send to Zoho Creator (async, don't wait for response)
    zohoService.createTicket(savedTicket).then(zohoResult => {
      if (zohoResult.success) {
        console.log(`Ticket ${savedTicket.id} sent to Zoho successfully:`, zohoResult.zohoId);
        // Optionally update the ticket with Zoho ID
        if (zohoResult.zohoId) {
          // Could add a zohoId field to database and update here
        }
      } else {
        console.error(`Failed to send ticket ${savedTicket.id} to Zoho:`, zohoResult.error);
      }
    }).catch(error => {
      console.error(`Error sending ticket ${savedTicket.id} to Zoho:`, error);
    });

    // Return created ticket
    res.status(201).json({
      success: true,
      data: savedTicket,
      aiAnalysis: {
        category: aiAnalysis.category,
        priority: aiAnalysis.priority,
        summary: aiAnalysis.summary,
        ...(aiAnalysis.entities && { entities: aiAnalysis.entities })
      }
    });
  })
);

// GET /api/tickets - Get all tickets with optional filtering
router.get('/',
  validateGetTickets,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const filters = {
      category: req.query.category,
      priority: req.query.priority,
      requestType: req.query.requestType,
      q: req.query.q,
      limit: req.query.limit || 50
    };

    console.log('Getting tickets with filters:', filters);

    const tickets = ticketDb.getAll(filters);

    res.json({
      success: true,
      data: tickets,
      count: tickets.length,
      filters: Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      )
    });
  })
);

// GET /api/tickets/:id - Get a single ticket by ID
router.get('/:id',
  validateTicketId,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const ticketId = req.params.id;
    
    console.log(`Getting ticket with ID: ${ticketId}`);

    const ticket = ticketDb.getById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
        id: ticketId
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  })
);

// GET /api/tickets/stats/summary - Get ticket statistics
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const stats = ticketDb.getStats();
  
  res.json({
    success: true,
    data: stats
  });
}));

// Health check endpoint
router.get('/health/status', asyncHandler(async (req, res) => {
  const aiHealthy = await aiService.healthCheck();
  const zohoHealthy = await zohoService.healthCheck();
  const zohoConfigured = zohoService.isConfigured();

  res.json({
    success: true,
    services: {
      database: true, // If we can respond, database is working
      ai: aiHealthy,
      zoho: {
        configured: zohoConfigured,
        healthy: zohoHealthy
      }
    },
    timestamp: new Date().toISOString()
  });
}));

export default router;