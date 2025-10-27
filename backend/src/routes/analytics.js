import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import TicketDatabase from '../database/tickets.js';

const router = express.Router();
const ticketDb = new TicketDatabase();

// GET /api/analytics/ai-confidence - Analyze AI confidence scores
router.get('/ai-confidence', asyncHandler(async (req, res) => {
    const tickets = ticketDb.getAll({ limit: 1000 });
    
    if (tickets.length === 0) {
        return res.json({
            success: true,
            data: {
                totalTickets: 0,
                message: "No tickets available for analysis"
            }
        });
    }

    // Parse AI analysis data from ticket summaries and categories
    const aiAnalysis = {
        totalTickets: tickets.length,
        categoryAnalysis: analyzeCategoryAccuracy(tickets),
        priorityAnalysis: analyzePriorityDistribution(tickets),
        confidenceMetrics: calculateConfidenceMetrics(tickets),
        recommendations: generateRecommendations(tickets)
    };

    res.json({
        success: true,
        data: aiAnalysis
    });
}));

// GET /api/analytics/low-confidence - Find tickets with low confidence scores
router.get('/low-confidence', asyncHandler(async (req, res) => {
    const threshold = parseFloat(req.query.threshold) || 0.7;
    const tickets = ticketDb.getAll({ limit: 1000 });
    
    // In a real implementation, you'd store confidence scores in the database
    // For now, we'll simulate based on category and priority assignment patterns
    const lowConfidenceTickets = tickets.filter(ticket => {
        // Simulate confidence analysis
        const hasAmbiguousCategory = ticket.category === 'General';
        const hasBasicDescription = ticket.description.length < 50;
        const lacksPriorityKeywords = !containsUrgencyKeywords(ticket.description);
        
        return hasAmbiguousCategory || hasBasicDescription || lacksPriorityKeywords;
    }).slice(0, 20);

    res.json({
        success: true,
        data: {
            threshold,
            lowConfidenceCount: lowConfidenceTickets.length,
            tickets: lowConfidenceTickets.map(ticket => ({
                id: ticket.id,
                category: ticket.category,
                priority: ticket.priority,
                description: ticket.description.substring(0, 100) + '...',
                estimatedConfidence: estimateConfidence(ticket)
            }))
        }
    });
}));

// GET /api/analytics/performance - Overall AI performance metrics
router.get('/performance', asyncHandler(async (req, res) => {
    const tickets = ticketDb.getAll({ limit: 1000 });
    
    const performance = {
        totalAnalyzed: tickets.length,
        categoryDistribution: getCategoryDistribution(tickets),
        priorityDistribution: getPriorityDistribution(tickets),
        avgResponseTime: "~150ms", // Would be measured in production
        systemHealth: {
            aiServiceUptime: "99.5%", // Would be monitored
            averageConfidence: calculateAverageConfidence(tickets),
            accuracyScore: calculateAccuracyScore(tickets)
        }
    };

    res.json({
        success: true,
        data: performance
    });
}));

// Helper functions
function analyzeCategoryAccuracy(tickets) {
    const categories = ['Network', 'Security', 'Cloud', 'General'];
    const analysis = {};
    
    categories.forEach(category => {
        const categoryTickets = tickets.filter(t => t.category === category);
        analysis[category] = {
            count: categoryTickets.length,
            percentage: ((categoryTickets.length / tickets.length) * 100).toFixed(1),
            avgConfidence: calculateAvgConfidenceForCategory(categoryTickets)
        };
    });
    
    return analysis;
}

function analyzePriorityDistribution(tickets) {
    const priorities = ['Low', 'Medium', 'High', 'Urgent'];
    const distribution = {};
    
    priorities.forEach(priority => {
        const priorityTickets = tickets.filter(t => t.priority === priority);
        distribution[priority] = {
            count: priorityTickets.length,
            percentage: ((priorityTickets.length / tickets.length) * 100).toFixed(1)
        };
    });
    
    return distribution;
}

function calculateConfidenceMetrics(tickets) {
    // Simulate confidence calculations based on ticket characteristics
    const confidenceScores = tickets.map(estimateConfidence);
    
    return {
        averageConfidence: (confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length).toFixed(3),
        highConfidence: confidenceScores.filter(c => c >= 0.8).length,
        mediumConfidence: confidenceScores.filter(c => c >= 0.6 && c < 0.8).length,
        lowConfidence: confidenceScores.filter(c => c < 0.6).length
    };
}

function generateRecommendations(tickets) {
    const recommendations = [];
    
    const generalTickets = tickets.filter(t => t.category === 'General').length;
    if (generalTickets > tickets.length * 0.3) {
        recommendations.push("High number of 'General' category tickets suggests need for more specific classification rules");
    }
    
    const lowPriorityTickets = tickets.filter(t => t.priority === 'Low').length;
    if (lowPriorityTickets > tickets.length * 0.5) {
        recommendations.push("Consider reviewing priority detection keywords - many tickets classified as Low priority");
    }
    
    if (tickets.length < 10) {
        recommendations.push("More training data needed for better AI accuracy - current dataset is small");
    }
    
    return recommendations;
}

function containsUrgencyKeywords(description) {
    const urgentKeywords = ['urgent', 'critical', 'emergency', 'asap', 'immediately', 'down', 'broken'];
    return urgentKeywords.some(keyword => description.toLowerCase().includes(keyword));
}

function estimateConfidence(ticket) {
    let confidence = 0.5;
    
    // Higher confidence for specific categories
    if (ticket.category !== 'General') confidence += 0.2;
    
    // Higher confidence for longer descriptions
    if (ticket.description.length > 100) confidence += 0.1;
    
    // Higher confidence if priority matches urgency keywords
    const hasUrgentKeywords = containsUrgencyKeywords(ticket.description);
    if ((ticket.priority === 'Urgent' || ticket.priority === 'High') && hasUrgentKeywords) {
        confidence += 0.2;
    }
    
    return Math.min(0.95, confidence);
}

function calculateAvgConfidenceForCategory(categoryTickets) {
    if (categoryTickets.length === 0) return 0;
    const confidences = categoryTickets.map(estimateConfidence);
    return (confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(3);
}

function getCategoryDistribution(tickets) {
    const dist = {};
    tickets.forEach(ticket => {
        dist[ticket.category] = (dist[ticket.category] || 0) + 1;
    });
    return dist;
}

function getPriorityDistribution(tickets) {
    const dist = {};
    tickets.forEach(ticket => {
        dist[ticket.priority] = (dist[ticket.priority] || 0) + 1;
    });
    return dist;
}

function calculateAverageConfidence(tickets) {
    const confidences = tickets.map(estimateConfidence);
    return (confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(3);
}

function calculateAccuracyScore(tickets) {
    // Simplified accuracy calculation
    const highConfidenceTickets = tickets.filter(t => estimateConfidence(t) >= 0.8).length;
    return ((highConfidenceTickets / tickets.length) * 100).toFixed(1) + '%';
}

export default router;