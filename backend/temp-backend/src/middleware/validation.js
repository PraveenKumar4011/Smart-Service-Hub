import { body, param, query, validationResult } from 'express-validator';

// Ticket creation validation
export const validateTicketCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('requestType')
    .notEmpty()
    .withMessage('Request type is required')
    .isIn(['Network', 'Security', 'Cloud', 'General'])
    .withMessage('Request type must be one of: Network, Security, Cloud, General'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('audioBase64')
    .optional()
    .isString()
    .withMessage('Audio data must be a string')
    .custom(value => {
      if (value && !value.startsWith('data:audio/')) {
        throw new Error('Invalid audio format');
      }
      return true;
    })
];

// Get tickets validation
export const validateGetTickets = [
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  
  query('priority')
    .optional()
    .isString()
    .withMessage('Priority must be a string'),
  
  query('requestType')
    .optional()
    .isIn(['Network', 'Security', 'Cloud', 'General'])
    .withMessage('Request type must be one of: Network, Security, Cloud, General'),
  
  query('q')
    .optional()
    .isString()
    .withMessage('Search query must be a string')
    .isLength({ max: 100 })
    .withMessage('Search query too long'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt()
];

// Get ticket by ID validation
export const validateTicketId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Ticket ID must be a positive integer')
    .toInt()
];

// Error handling middleware for validation
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    // Remove any potentially dangerous HTML/script tags from text fields
    const sanitizeString = (str) => {
      if (typeof str === 'string') {
        return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/<[^>]+>/g, '')
                  .trim();
      }
      return str;
    };

    Object.keys(req.body).forEach(key => {
      if (key !== 'audioBase64' && typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }
  
  next();
};