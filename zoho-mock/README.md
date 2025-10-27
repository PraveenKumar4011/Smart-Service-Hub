# Zoho Creator Mock API

A Node.js Express server that simulates the Zoho Creator REST API for testing and development purposes.

## Features

- **Authentication**: x-api-key header validation
- **Deluge-style Validation**: Email validation and field requirements matching Zoho Creator
- **Request Logging**: All requests logged to `zoho_requests.log` for demo and debugging
- **Schema Endpoint**: Returns sample Zoho Creator form schema
- **CORS Enabled**: Ready for frontend integration
- **Error Handling**: Proper HTTP status codes and Zoho-style error responses

## Quick Start

```bash
# Install dependencies
npm install

# Start server (default port 5002)
npm start

# Or start in development mode with auto-reload
npm run dev

# Health check
curl http://localhost:5002/health
```

## API Endpoints

### Authentication

All protected endpoints require the `x-api-key` header:

```bash
curl -H "x-api-key: zoho-test-key-2024" http://localhost:5002/zoho/mock/records
```

Default API key: `zoho-test-key-2024` (configurable via `ZOHO_API_KEY` env var)

### GET /zoho/mock/schema

Returns the form schema for client consumption.

```bash
curl http://localhost:5002/zoho/mock/schema
```

**Response:**
```json
{
  "success": true,
  "data": {
    "application": "service-tickets",
    "form": "Ticket_Submissions",
    "fields": [
      {
        "api_name": "Name",
        "display_name": "Customer Name",
        "data_type": "singleline",
        "mandatory": true,
        "max_length": 100
      },
      {
        "api_name": "Email",
        "display_name": "Email Address",
        "data_type": "email",
        "mandatory": true
      }
    ]
  }
}
```

### POST /zoho/mock/records

Creates a new record with validation. Requires `x-api-key` header.

```bash
curl -X POST http://localhost:5002/zoho/mock/records \
  -H "Content-Type: application/json" \
  -H "x-api-key: zoho-test-key-2024" \
  -d '{
    "Name": "John Doe",
    "Email": "john@example.com",
    "Phone": "+1-555-0123",
    "Category": "Network",
    "Priority": "High",
    "Description": "Server connection issues",
    "AI_Summary": "Network connectivity problem",
    "AI_Entities": {
      "device": "server",
      "location": "data center"
    }
  }'
```

**Success Response (201):**
```json
{
  "status": "success",
  "code": "SUCCESS",
  "message": "Record created successfully",
  "data": {
    "ID": "1a2b3c4d5e6f7g8h9i0",
    "Name": "John Doe",
    "Email": "john@example.com",
    "Phone": "+1-555-0123",
    "Category": "Network",
    "Priority": "High",
    "Description": "Server connection issues",
    "AI_Summary": "Network connectivity problem",
    "AI_Entities": "{\"device\":\"server\",\"location\":\"data center\"}",
    "Added_User": "zoho.mock.user",
    "Added_Time": "2024-10-27T12:00:00.000Z",
    "Modified_Time": "2024-10-27T12:00:00.000Z"
  }
}
```

### GET /zoho/mock/records

Lists existing records (requires authentication).

```bash
curl -H "x-api-key: zoho-test-key-2024" http://localhost:5002/zoho/mock/records
```

### GET /zoho/mock/logs

View recent API request logs (for debugging).

```bash
curl http://localhost:5002/zoho/mock/logs
```

## Validation Rules

The API implements Zoho Creator-style validation:

### Required Fields
- `Name`: Customer name (1-100 characters)
- `Email`: Valid email address
- `Description`: Issue description
- `Category`: Must be one of: Network, Security, Cloud, General

### Optional Fields
- `Phone`: Phone number
- `Priority`: Low, Medium, High, Urgent (defaults to Medium)
- `AI_Summary`: AI-generated summary
- `AI_Entities`: JSON object with extracted entities

### Error Responses

**Missing API Key (401):**
```json
{
  "error": "Authentication failed",
  "code": "INVALID_TOKEN",
  "message": "API key is required in x-api-key header"
}
```

**Invalid Email (400):**
```json
{
  "error": "Validation failed",
  "code": "INVALID_DATA",
  "message": "Data validation errors occurred",
  "details": [
    {
      "field": "Email",
      "message": "Invalid email format",
      "code": "FIELD_VALIDATION_ERROR"
    }
  ]
}
```

## Integration with Smart Service Hub

Update your backend's Zoho configuration to point to the mock service:

```javascript
// In your backend config
const ZOHO_CONFIG = {
  baseUrl: 'http://localhost:5002',
  apiKey: 'zoho-test-key-2024',
  endpoints: {
    records: '/zoho/mock/records',
    schema: '/zoho/mock/schema'
  }
};
```

Example backend integration:

```javascript
const response = await fetch('http://localhost:5002/zoho/mock/records', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'zoho-test-key-2024'
  },
  body: JSON.stringify({
    Name: ticket.name,
    Email: ticket.email,
    Phone: ticket.phone,
    Category: aiAnalysis.category,
    Priority: aiAnalysis.priority,
    Description: ticket.description,
    AI_Summary: aiAnalysis.summary,
    AI_Entities: aiAnalysis.entities
  })
});
```

## Logs

All requests are logged to `zoho_requests.log` with:
- Timestamp
- Endpoint and method
- Headers (API key redacted)
- Request body
- Response data

Log format:
```json
{
  "timestamp": "2024-10-27T12:00:00.000Z",
  "endpoint": "/zoho/mock/records",
  "method": "POST",
  "headers": {
    "x-api-key": "***REDACTED***",
    "content-type": "application/json"
  },
  "body": { "Name": "John Doe", "Email": "john@example.com" },
  "response": { "status": "success", "data": {...} }
}
```

## Environment Variables

- `PORT`: Server port (default: 5002)
- `ZOHO_API_KEY`: API key for authentication (default: zoho-test-key-2024)

## Development

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Run tests
npm test
```

## Production Deployment

For production use, set environment variables:

```bash
export PORT=5002
export ZOHO_API_KEY=your-secure-api-key
npm start
```

## Differences from Real Zoho Creator API

This mock service simplifies some Zoho Creator behaviors:

1. **Authentication**: Uses simple API key instead of OAuth2
2. **IDs**: Generates UUID-based IDs instead of Zoho's format
3. **Timestamps**: Uses ISO format instead of Zoho's custom format
4. **Validation**: Implements core validation but not all Zoho rules
5. **Responses**: Simplified response structure

## Support

For issues or questions about integrating with the Smart Service Hub backend, refer to the main project documentation or check the logs endpoint for debugging information.