# Smart Service Hub - Backend API

A Node.js + Express backend API for the Smart Service Hub ticket management system.

## Quick Start

```bash
cd backend
npm install
npm run db:setup
npm run dev
```

## API Endpoints

### POST /api/tickets
Creates a new support ticket.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com", 
  "requestType": "Network",
  "description": "Having trouble with internet connection"
}
```

### GET /api/tickets
Get all tickets with optional filtering: `?category=Network&priority=High`

### GET /api/tickets/:id
Get specific ticket by ID.

## cURL Examples

```bash
# Create ticket
curl -X POST http://localhost:3001/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Smith","email":"jane@company.com","requestType":"Security","description":"Password reset needed"}'

# Get tickets  
curl http://localhost:3001/api/tickets

# Health check
curl http://localhost:3001/health
```