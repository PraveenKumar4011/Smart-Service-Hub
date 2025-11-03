# Smart Service Hub - Backend Architecture Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Backend API](#backend-api)
3. [AI Microservice](#ai-microservice)
4. [Zoho Integration](#zoho-integration)
5. [Zoho Mock Service](#zoho-mock-service)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Data Flow](#data-flow)
8. [Deployment](#deployment)

---

## 🏗️ System Overview

### Architecture Diagram
```
┌─────────────┐
│   Frontend  │ (React + Vite)
│  Port 5173  │
└──────┬──────┘
       │ HTTP REST API
       ↓
┌─────────────────────────────────────┐
│     Backend API (Node.js + Express) │
│            Port 3001                │
├─────────────────────────────────────┤
│ • Ticket Management                 │
│ • Request Validation                │
│ • Database (SQLite)                 │
│ • API Orchestration                 │
└──────┬───────────────────┬──────────┘
       │                   │
       │                   │ OAuth 2.0
       ↓                   ↓
┌──────────────┐    ┌─────────────────┐
│AI Microservice│    │ Zoho Creator API│
│  Port 3002    │    │  (Production)   │
│  (Flask)      │    └─────────────────┘
└───────────────┘
       │
       │ (Development/Testing)
       ↓
┌──────────────┐
│  Zoho Mock   │
│  Port 5002   │
└──────────────┘
```

---

## 🚀 Backend API

### Location: `backend/`

### Technology Stack
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: SQLite (with better-sqlite3)
- **Authentication**: OAuth 2.0 (for Zoho)
- **Validation**: express-validator
- **Security**: helmet, cors

### Directory Structure
```
backend/
├── src/
│   ├── server.js              # Main application entry point
│   ├── config/
│   │   └── index.js           # Environment configuration
│   ├── database/
│   │   ├── tickets.js         # SQLite database operations
│   │   └── tickets.db         # SQLite database file
│   ├── middleware/
│   │   ├── errorHandler.js    # Global error handling
│   │   └── validation.js      # Request validation rules
│   ├── routes/
│   │   ├── tickets.js         # Ticket CRUD endpoints
│   │   └── analytics.js       # Analytics endpoints
│   └── services/
│       ├── aiService.js       # AI microservice client
│       ├── zohoService.js     # Zoho Creator integration
│       └── zohoOAuthService.js # OAuth token management
├── tests/
│   └── tickets.test.js        # API integration tests
├── package.json
├── .env                       # Environment variables
└── Dockerfile                 # Container configuration
```

### Core Components

#### 1. Server Configuration (`server.js`)
```javascript
// Key responsibilities:
- Initialize Express app
- Configure middleware (CORS, Helmet, JSON parsing)
- Mount API routes
- Error handling
- Health check endpoint
```

#### 2. Database Layer (`database/tickets.js`)
```javascript
class TicketDatabase {
  // Uses SQLite with better-sqlite3
  // Provides:
  - create(ticketData)     // Insert new ticket
  - getById(id)            // Retrieve single ticket
  - getAll(filters)        // Query with filtering
  - getStats()             // Analytics aggregation
}
```

**Schema:**
```sql
CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  requestType TEXT NOT NULL,
  description TEXT NOT NULL,
  audioBase64 TEXT,
  category TEXT,
  priority TEXT,
  summary TEXT,
  entities TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### 3. API Routes (`routes/tickets.js`)

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tickets` | Create new ticket |
| GET | `/api/tickets` | List tickets (with filters) |
| GET | `/api/tickets/:id` | Get single ticket |
| GET | `/api/tickets/stats/summary` | Get statistics |
| GET | `/api/tickets/health/status` | Health check |

**Request Flow for POST `/api/tickets`:**
```
1. Request arrives → Validation middleware
2. Extract: { name, email, requestType, description, audioBase64 }
3. Call AI Microservice → Get analysis
4. Save to SQLite database
5. Async: Send to Zoho Creator
6. Return response to frontend
```

#### 4. AI Service Integration (`services/aiService.js`)

```javascript
class AIService {
  async analyzeTicket(data) {
    // POST to AI microservice
    // Endpoint: http://ai-service:3002/analyze
    
    // Input: { description, requestType, audioBase64 }
    // Output: { category, priority, summary, entities }
  }
}
```

**How it connects:**
```javascript
// Uses axios HTTP client
const response = await axios.post(
  `${AI_BASE_URL}/analyze`,
  { description, requestType, audioBase64 },
  { timeout: 30000 }
);
```

#### 5. Zoho Integration (`services/zohoService.js`)

**OAuth Service (`zohoOAuthService.js`):**
```javascript
class ZohoOAuthService {
  // Manages OAuth 2.0 tokens
  
  refreshAccessToken() {
    // Exchange refresh_token for new access_token
    // POST https://accounts.zoho.in/oauth/v2/token
    // Params: refresh_token, client_id, client_secret, grant_type
  }
  
  makeAuthenticatedRequest(url, method, data) {
    // 1. Get current access_token
    // 2. Make API call with Authorization header
    // 3. If 401 → refresh token and retry
    // 4. Return response
  }
}
```

**Zoho Service (`zohoService.js`):**
```javascript
class ZohoService {
  async createTicket(ticketData) {
    // Prepare payload
    const payload = {
      data: {
        Name: { first_name, last_name },
        Email,
        Request_Type,
        Description,
        Category,
        Priority,
        Summary,
        Entities
      }
    };
    
    // Send via OAuth service
    return await zohoOAuthService.makeAuthenticatedRequest(
      this.url,
      'POST',
      payload
    );
  }
}
```

**Zoho Creator API Flow:**
```
Backend → OAuth Service → Zoho Accounts (refresh if needed) → Zoho Creator API
                              ↓
                         Access Token
                              ↓
                    POST with Bearer token
                              ↓
                    Response: { code: 3000, data: { ID: ... } }
```

---

## 🤖 AI Microservice

### Location: `ai-microservice/`

### Technology Stack
- **Language**: Python 3.9+
- **Framework**: Flask
- **Libraries**: 
  - `transformers` (Hugging Face)
  - `torch` (PyTorch)
  - NLP models for text analysis

### Structure
```
ai-microservice/
├── app.py                     # Flask application
├── models/
│   └── analyzer.py            # NLP model wrapper
├── utils/
│   └── preprocessing.py       # Text preprocessing
├── requirements.txt           # Python dependencies
└── Dockerfile
```

### How It Works

#### 1. Flask Application (`app.py`)
```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze_ticket():
    """
    Input: {
        "description": "Cannot connect to VPN",
        "requestType": "Network",
        "audioBase64": null
    }
    
    Output: {
        "category": "Network",
        "priority": "High",
        "summary": "VPN connection issue",
        "entities": ["VPN"]
    }
    """
    data = request.json
    
    # 1. Preprocess text
    text = preprocess(data['description'])
    
    # 2. Run NLP analysis
    category = categorize_text(text)
    priority = assess_priority(text)
    summary = generate_summary(text)
    entities = extract_entities(text)
    
    # 3. Return results
    return jsonify({
        'category': category,
        'priority': priority,
        'summary': summary,
        'entities': entities
    })
```

#### 2. Analysis Pipeline

**Category Classification:**
```python
# Uses pre-trained BERT model
def categorize_text(text):
    # Categories: Network, Security, Cloud, General
    model_output = classifier(text)
    return model_output['label']
```

**Priority Assessment:**
```python
# Keywords and urgency detection
URGENT_KEYWORDS = ['critical', 'down', 'broken', 'urgent', 'asap']

def assess_priority(text):
    if any(keyword in text.lower() for keyword in URGENT_KEYWORDS):
        return 'High'
    # ... additional logic
    return 'Medium'
```

**Entity Extraction:**
```python
# Named Entity Recognition (NER)
def extract_entities(text):
    entities = ner_model(text)
    return [e['word'] for e in entities if e['score'] > 0.9]
```

### API Connection from Backend

```javascript
// Backend makes HTTP call to AI service
const aiResponse = await axios.post(
  'http://ai-microservice:3002/analyze',
  {
    description: "My laptop won't turn on",
    requestType: "Hardware",
    audioBase64: null
  }
);

// Response:
{
  category: "Hardware",
  priority: "High",
  summary: "Laptop power failure",
  entities: ["laptop"]
}
```

---

## 📊 Zoho Integration

### How It Works

#### 1. OAuth 2.0 Setup
```
1. Register Server-based Application in Zoho API Console
2. Get: Client ID, Client Secret
3. Generate Authorization Code (with redirect URI)
4. Exchange Code for Access Token + Refresh Token
5. Store Refresh Token (never expires)
6. Use Access Token for API calls (expires in 1 hour)
7. Auto-refresh when expired
```

#### 2. Token Refresh Flow
```javascript
// Stored in environment
ZOHO_CLIENT_ID=1000.DC6KPBUK80K8EEGL4C4J4L00KM60GF
ZOHO_CLIENT_SECRET=09d4caed45638363103b3b0726f8e6bd24c0d4e0a4
ZOHO_REFRESH_TOKEN=1000.e782c84b72155b8d3f525c45d387122c...
ZOHOCREATOR_API_KEY=1000.e22e6fec37b5346c260e2609923ae8cb... (current)

// When access token expires:
POST https://accounts.zoho.in/oauth/v2/token
Params:
  refresh_token: ZOHO_REFRESH_TOKEN
  client_id: ZOHO_CLIENT_ID
  client_secret: ZOHO_CLIENT_SECRET
  grant_type: refresh_token

Response:
{
  access_token: "new_token",
  expires_in: 3600
}
```

#### 3. Data Submission to Zoho Creator

**API Endpoint:**
```
POST https://creator.zoho.in/api/v2.1/pk.08497121/smart-service-hub/form/Service_Hub_Form
```

**Headers:**
```
Content-Type: application/json
Authorization: Zoho-oauthtoken {access_token}
```

**Payload:**
```json
{
  "data": {
    "Name": {
      "first_name": "John",
      "last_name": "Doe"
    },
    "Email": "john@example.com",
    "Request_Type": "Network",
    "Description": "Cannot connect to VPN",
    "Category": "Network",
    "Priority": "High",
    "Summary": "VPN connection issue",
    "Entities": "[\"VPN\"]"
  }
}
```

**Response:**
```json
{
  "code": 3000,
  "data": {
    "ID": "352071000000020005"
  },
  "message": "Data Added Successfully"
}
```

---

## 🧪 Zoho Mock Service

### Location: `zoho-mock/`

### Purpose
- Test Zoho integration without hitting real API
- Simulate Zoho Creator responses
- Log requests for debugging
- Validate payload structure

### Structure
```
zoho-mock/
├── server.js              # Express mock server
├── zoho_requests.log      # Request log file
├── package.json
└── Dockerfile
```

### How It Works

```javascript
// Mock server simulates Zoho Creator API
app.post('/zoho/mock/records', (req, res) => {
  const { Name, Email, Category, Priority, Description } = req.body;
  
  // Validate required fields
  if (!Name || !Email || !Description) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'INVALID_DATA'
    });
  }
  
  // Generate fake Zoho ID
  const zohoId = uuid().replace(/-/g, '').substring(0, 19);
  
  // Log request
  fs.appendFileSync('zoho_requests.log', JSON.stringify({
    timestamp: new Date(),
    body: req.body,
    response: { ID: zohoId }
  }));
  
  // Return mock response
  res.status(201).json({
    status: 'success',
    code: 'SUCCESS',
    data: {
      ID: zohoId,
      ...req.body
    }
  });
});
```

### Usage in Development

```javascript
// In backend .env for development:
ZOHOCREATOR_URL=http://localhost:5002/zoho/mock/records
ZOHOCREATOR_API_KEY=zoho-test-key-2024

// The backend sends to mock instead of real Zoho
// Perfect for testing without API rate limits
```

---

## 🔄 CI/CD Pipeline

### Location: `.github/workflows/`

### Files
```
.github/workflows/
├── ci.yml         # Continuous Integration
├── cd.yml         # Continuous Deployment
└── docker.yml     # Docker build & push
```

### 1. CI Pipeline (`ci.yml`)

**Triggers:**
- Push to any branch
- Pull requests to `main`

**Jobs:**

```yaml
Backend Tests:
  - Checkout code
  - Setup Node.js 18
  - Install dependencies (npm ci)
  - Run linter (npm run lint)
  - Run tests (npm test)
  - Upload coverage reports

AI Microservice Tests:
  - Checkout code
  - Setup Python 3.9
  - Install dependencies (pip install -r requirements.txt)
  - Run tests (pytest)
  - Run linter (flake8)

Frontend Tests:
  - Checkout code
  - Setup Node.js 18
  - Install dependencies
  - Run build (npm run build)
  - Run tests (npm test)
```

**What Happens:**
```
1. Developer pushes code
2. GitHub Actions triggered
3. All tests run in parallel
4. If any test fails → Build fails → Cannot merge
5. If all pass → Green checkmark → Ready to merge
```

### 2. CD Pipeline (`cd.yml`)

**Triggers:**
- Push to `main` branch (after merge)

**Jobs:**

```yaml
Deploy Backend:
  - Build backend Docker image
  - Push to container registry
  - Deploy to Render/Railway
  - Run smoke tests

Deploy AI Service:
  - Build AI microservice image
  - Push to registry
  - Deploy to Render/Railway
  - Verify health endpoint

Deploy Frontend:
  - Build production bundle
  - Upload to CDN/static host
  - Update environment variables
```

**Deployment Flow:**
```
main branch updated
    ↓
GitHub Actions
    ↓
Build Docker images
    ↓
Push to Registry (Docker Hub / GitHub Container Registry)
    ↓
Trigger deployment hooks
    ↓
Render/Railway pulls new image
    ↓
Rolling deployment (zero downtime)
    ↓
Health checks
    ↓
Deployment complete ✅
```

### 3. Docker Pipeline (`docker.yml`)

**Purpose:** Build and publish Docker images

```yaml
Build & Push:
  - Set up Docker Buildx
  - Login to Docker Hub
  - Build multi-platform images (amd64, arm64)
  - Tag with version and 'latest'
  - Push to registry
```

**Images Created:**
```
smart-service-hub/backend:latest
smart-service-hub/backend:v1.2.3

smart-service-hub/ai-microservice:latest
smart-service-hub/ai-microservice:v1.2.3

smart-service-hub/zoho-mock:latest
smart-service-hub/zoho-mock:v1.2.3
```

### Environment Variables in CI/CD

**GitHub Secrets (configured in repository settings):**
```
DOCKER_USERNAME
DOCKER_PASSWORD
RENDER_API_KEY
RAILWAY_TOKEN
ZOHO_CLIENT_ID
ZOHO_CLIENT_SECRET
ZOHO_REFRESH_TOKEN
```

**How They're Used:**
```yaml
# In GitHub Actions workflow
- name: Deploy to Render
  env:
    RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
    ZOHO_CLIENT_ID: ${{ secrets.ZOHO_CLIENT_ID }}
  run: |
    curl -X POST render.com/api/deploy \
      -H "Authorization: Bearer $RENDER_API_KEY" \
      -d '{"serviceId": "backend"}'
```

---

## 📡 Data Flow

### Complete Request Flow

```
1. User submits ticket via Frontend
   ↓
   POST http://frontend.com/submit
   Body: { name, email, requestType, description }

2. Frontend → Backend API
   ↓
   POST http://backend-api.com/api/tickets
   Headers: Content-Type: application/json

3. Backend: Validation
   ↓
   express-validator checks:
   - name: required, 2-100 chars
   - email: valid format
   - requestType: one of [Network, Security, Cloud, General]
   - description: required, 20-2000 chars

4. Backend → AI Microservice
   ↓
   POST http://ai-service:3002/analyze
   Body: { description, requestType }
   ↓
   Response: { category, priority, summary, entities }

5. Backend: Save to Database
   ↓
   INSERT INTO tickets (name, email, requestType, description, 
                        category, priority, summary, entities, createdAt)
   VALUES (...)
   ↓
   Database returns: { id: 123, ...ticketData }

6. Backend → Frontend Response (immediate)
   ↓
   HTTP 201 Created
   {
     "success": true,
     "data": { id: 123, name, email, ... },
     "aiAnalysis": { category, priority, summary }
   }

7. Backend → Zoho Creator (async, non-blocking)
   ↓
   zohoOAuthService.makeAuthenticatedRequest()
   ↓
   Check access token → Refresh if expired
   ↓
   POST https://creator.zoho.in/api/v2.1/.../form/Service_Hub_Form
   Headers: Authorization: Zoho-oauthtoken {token}
   Body: { data: { Name, Email, Request_Type, ... } }
   ↓
   Zoho Response: { code: 3000, data: { ID: "..." } }
   ↓
   Log result (success or error)
```

### Error Handling Flow

```
Any error occurs
    ↓
Caught by try-catch in route handler
    ↓
Passed to error middleware
    ↓
errorHandler.js formats response
    ↓
Return to client:
{
  "success": false,
  "error": "Description of error",
  "details": [...] // if validation error
}
    ↓
Log error for monitoring
```

---

## 🚢 Deployment

### Architecture on Render/Railway

```
┌─────────────────────────────────────┐
│          Render Services            │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────┐               │
│  │   Frontend      │               │
│  │   Static Site   │               │
│  │   (Vite Build)  │               │
│  └────────┬────────┘               │
│           │                         │
│           ↓ API Calls               │
│  ┌─────────────────┐               │
│  │   Backend API   │               │
│  │   Web Service   │               │
│  │   Port: 10000   │               │
│  └────────┬────────┘               │
│           │                         │
│           ├─→ AI Microservice       │
│           │   (Railway)             │
│           │                         │
│           └─→ Zoho Creator API      │
│               (External)            │
│                                     │
└─────────────────────────────────────┘
```

### Deployment Configuration

**render.yaml:**
```yaml
services:
  - type: web
    name: smart-hub-backend
    runtime: node
    plan: free
    rootDir: ./backend
    buildCommand: npm ci
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: AI_BASE_URL
        value: https://ai-service.railway.app
      - key: ZOHOCREATOR_URL
        value: https://creator.zoho.in/api/v2.1/pk.08497121/smart-service-hub/form/Service_Hub_Form
      - key: ZOHOCREATOR_API_KEY
        sync: false  # Populated from dashboard
      - key: ZOHO_CLIENT_ID
        sync: false
      - key: ZOHO_CLIENT_SECRET
        sync: false
      - key: ZOHO_REFRESH_TOKEN
        sync: false
```

### Health Checks

**Backend:**
```javascript
GET /health
Response: {
  "status": "healthy",
  "timestamp": "2025-11-03T12:00:00Z",
  "uptime": 3600
}
```

**AI Microservice:**
```python
GET /health
Response: {
  "status": "healthy",
  "model_loaded": true
}
```

---

## 🔍 Monitoring & Logging

### Backend Logs
```javascript
// Console logs in production
console.log('Creating ticket for', name);
console.log('AI analysis result:', aiAnalysis);
console.log('Sending to Zoho:', payload);

// Zoho response logging
console.log('Zoho response:', response.status, response.data);
console.error('Zoho error:', error);
```

### Access Logs
```
Morgan middleware logs all HTTP requests:
GET /api/tickets 200 45ms
POST /api/tickets 201 1234ms
GET /health 200 3ms
```

---

## 📝 Summary

### Key Technologies
- **Backend**: Node.js + Express + SQLite
- **AI Service**: Python + Flask + Transformers
- **Integration**: OAuth 2.0 + REST APIs
- **Deployment**: Docker + Render/Railway
- **CI/CD**: GitHub Actions

### Data Flow Summary
```
Frontend → Backend → AI Service → Backend → Database
                              → Zoho Creator (async)
```

### Security Features
- OAuth 2.0 token refresh
- Request validation
- SQL injection prevention (parameterized queries)
- CORS configuration
- Helmet security headers
- Environment variable isolation

### Performance Optimizations
- Async Zoho submission (non-blocking)
- Database indexing
- HTTP timeouts
- Connection pooling (planned)
- Caching (planned)

---

**Documentation Version:** 1.0  
**Last Updated:** November 3, 2025  
**Maintained By:** Smart Service Hub Team
