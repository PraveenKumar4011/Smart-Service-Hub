import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 5002;
const API_KEY = process.env.ZOHO_API_KEY || 'zoho-test-key-2024';
const LOG_FILE = 'zoho_requests.log';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Utility function to log requests
const logRequest = (endpoint, method, headers, body, response) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        endpoint,
        method,
        headers: {
            'x-api-key': headers['x-api-key'] ? '***REDACTED***' : 'missing',
            'content-type': headers['content-type'],
            'user-agent': headers['user-agent']
        },
        body,
        response,
        separator: '---'
    };
    
    const logLine = JSON.stringify(logEntry, null, 2) + '\n\n';
    fs.appendFileSync(LOG_FILE, logLine);
};

// Email validation function (Deluge-style)
const validateEmail = (email) => {
    if (!email) {
        return { valid: false, error: 'Email is required' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Invalid email format' };
    }
    
    return { valid: true };
};

// Authentication middleware
const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        const response = {
            error: 'Authentication failed',
            code: 'INVALID_TOKEN',
            message: 'API key is required in x-api-key header'
        };
        
        logRequest(req.path, req.method, req.headers, req.body, response);
        
        return res.status(401).json(response);
    }
    
    if (apiKey !== API_KEY) {
        const response = {
            error: 'Authentication failed',
            code: 'INVALID_TOKEN',
            message: 'Invalid API key provided'
        };
        
        logRequest(req.path, req.method, req.headers, req.body, response);
        
        return res.status(401).json(response);
    }
    
    next();
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Zoho Creator Mock API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// GET /zoho/mock/schema - Return sample schema
app.get('/zoho/mock/schema', (req, res) => {
    const schema = {
        application: 'service-tickets',
        form: 'Ticket_Submissions',
        fields: [
            {
                api_name: 'Name',
                display_name: 'Customer Name',
                data_type: 'singleline',
                mandatory: true,
                max_length: 100
            },
            {
                api_name: 'Email',
                display_name: 'Email Address',
                data_type: 'email',
                mandatory: true
            },
            {
                api_name: 'Phone',
                display_name: 'Phone Number',
                data_type: 'phonenumber',
                mandatory: false
            },
            {
                api_name: 'Category',
                display_name: 'Issue Category',
                data_type: 'dropdown',
                mandatory: true,
                options: ['Network', 'Security', 'Cloud', 'General']
            },
            {
                api_name: 'Priority',
                display_name: 'Priority Level',
                data_type: 'dropdown',
                mandatory: true,
                options: ['Low', 'Medium', 'High', 'Urgent']
            },
            {
                api_name: 'Description',
                display_name: 'Issue Description',
                data_type: 'multiline',
                mandatory: true,
                max_length: 2000
            },
            {
                api_name: 'AI_Summary',
                display_name: 'AI Generated Summary',
                data_type: 'singleline',
                mandatory: false
            },
            {
                api_name: 'AI_Entities',
                display_name: 'Extracted Entities',
                data_type: 'multiline',
                mandatory: false
            }
        ],
        created_by: 'Zoho Creator Mock',
        created_time: '2024-10-27T08:00:00Z'
    };
    
    const response = {
        success: true,
        data: schema
    };
    
    logRequest(req.path, req.method, req.headers, {}, response);
    res.json(response);
});

// POST /zoho/mock/records - Create new record with validation
app.post('/zoho/mock/records', authenticateApiKey, (req, res) => {
    const { body } = req;
    
    // Deluge-style email validation
    const emailValidation = validateEmail(body.Email);
    if (!emailValidation.valid) {
        const response = {
            error: 'Validation failed',
            code: 'INVALID_DATA',
            message: 'Data validation errors occurred',
            details: [
                {
                    field: 'Email',
                    message: emailValidation.error,
                    code: 'FIELD_VALIDATION_ERROR'
                }
            ]
        };
        
        logRequest(req.path, req.method, req.headers, body, response);
        
        return res.status(400).json(response);
    }
    
    // Additional Deluge-style validations
    const validationErrors = [];
    
    if (!body.Name || body.Name.trim().length === 0) {
        validationErrors.push({
            field: 'Name',
            message: 'Name is required',
            code: 'MANDATORY_FIELD_MISSING'
        });
    }
    
    if (!body.Description || body.Description.trim().length === 0) {
        validationErrors.push({
            field: 'Description',
            message: 'Description is required',
            code: 'MANDATORY_FIELD_MISSING'
        });
    }
    
    if (!body.Category || !['Network', 'Security', 'Cloud', 'General'].includes(body.Category)) {
        validationErrors.push({
            field: 'Category',
            message: 'Invalid category. Must be one of: Network, Security, Cloud, General',
            code: 'INVALID_CHOICE'
        });
    }
    
    if (validationErrors.length > 0) {
        const response = {
            error: 'Validation failed',
            code: 'INVALID_DATA',
            message: 'Data validation errors occurred',
            details: validationErrors
        };
        
        logRequest(req.path, req.method, req.headers, body, response);
        
        return res.status(400).json(response);
    }
    
    // Simulate successful record creation
    const zohoId = uuidv4().replace(/-/g, '').substring(0, 19); // Zoho-like ID
    const response = {
        status: 'success',
        code: 'SUCCESS',
        message: 'Record created successfully',
        data: {
            ID: zohoId,
            Name: body.Name,
            Email: body.Email,
            Phone: body.Phone || null,
            Category: body.Category,
            Priority: body.Priority || 'Medium',
            Description: body.Description,
            AI_Summary: body.AI_Summary || null,
            AI_Entities: body.AI_Entities ? JSON.stringify(body.AI_Entities) : null,
            Added_User: 'zoho.mock.user',
            Added_Time: new Date().toISOString(),
            Modified_Time: new Date().toISOString()
        }
    };
    
    logRequest(req.path, req.method, req.headers, body, response);
    
    res.status(201).json(response);
});

// GET /zoho/mock/records - List records (optional feature)
app.get('/zoho/mock/records', authenticateApiKey, (req, res) => {
    const response = {
        status: 'success',
        data: [
            {
                ID: '1234567890123456789',
                Name: 'John Doe',
                Email: 'john@example.com',
                Category: 'Network',
                Priority: 'High',
                Added_Time: '2024-10-27T10:00:00Z'
            }
        ],
        info: {
            count: 1,
            more_records: false
        }
    };
    
    logRequest(req.path, req.method, req.headers, {}, response);
    res.json(response);
});

// GET /zoho/mock/logs - View recent logs (for debugging)
app.get('/zoho/mock/logs', (req, res) => {
    try {
        if (!fs.existsSync(LOG_FILE)) {
            return res.json({
                success: true,
                message: 'No logs found',
                data: []
            });
        }
        
        const logs = fs.readFileSync(LOG_FILE, 'utf8');
        const logEntries = logs.split('\n\n')
            .filter(entry => entry.trim())
            .slice(-10) // Last 10 entries
            .map(entry => {
                try {
                    return JSON.parse(entry);
                } catch {
                    return { raw: entry };
                }
            });
        
        res.json({
            success: true,
            data: logEntries
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to read logs',
            message: error.message
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Zoho Creator Mock API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            schema: '/zoho/mock/schema',
            records: '/zoho/mock/records',
            logs: '/zoho/mock/logs'
        },
        authentication: 'x-api-key header required',
        documentation: 'See README.md for usage examples'
    });
});

// Error handling
app.use((req, res) => {
    const response = {
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
        timestamp: new Date().toISOString()
    };
    
    logRequest(req.path, req.method, req.headers, req.body, response);
    res.status(404).json(response);
});

app.use((error, req, res, next) => {
    console.error('Server error:', error);
    
    const response = {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString()
    };
    
    logRequest(req.path, req.method, req.headers, req.body, response);
    res.status(500).json(response);
});

// Start server
app.listen(PORT, () => {
    console.log(`🏢 Zoho Creator Mock API running on port ${PORT}`);
    console.log(`🔑 API Key: ${API_KEY}`);
    console.log(`📝 Logs: ${LOG_FILE}`);
    console.log(`🔗 Health: http://localhost:${PORT}/health`);
    console.log(`📊 Schema: http://localhost:${PORT}/zoho/mock/schema`);
    console.log(`🎯 Records: http://localhost:${PORT}/zoho/mock/records`);
    
    // Initialize log file
    if (!fs.existsSync(LOG_FILE)) {
        fs.writeFileSync(LOG_FILE, `# Zoho Creator Mock API Logs\n# Started: ${new Date().toISOString()}\n\n`);
    }
});

export default app;