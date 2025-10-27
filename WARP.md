# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Smart Service Hub is a single-page React frontend application for managing service tickets. Built with modern React patterns and Tailwind CSS for styling, it provides a responsive interface for creating and viewing support tickets with filtering capabilities.

## Development Commands

### Setup and Development
- `npm install` - Install dependencies
- `npm run dev` - Start development server at http://localhost:5173
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally

### Code Quality and Testing
- `npm run lint` - Run ESLint for code linting
- `npm test` - Run unit tests with Vitest and React Testing Library
- `npm run test:watch` - Run tests in watch mode

## Architecture Overview

### Core Structure
- **Entry Point**: `src/main.jsx` - React 19 app initialization with StrictMode
- **App Component**: `src/App.jsx` - Main app shell managing global state (toast notifications, refresh triggers)
- **API Layer**: `src/lib/api.js` - Centralized API functions for backend communication

### Component Architecture
The application follows a flat component structure in `src/components/`:

- **TicketForm.jsx** - Form for creating new tickets with validation
- **Dashboard.jsx** - Main data display with filtering, search, and responsive layouts (table on desktop, cards on mobile)
- **TicketCard.jsx** - Individual ticket display component for mobile view
- **Toast.jsx** - Global notification system
- **Badge.jsx** - Reusable status/category indicator component
- **AppHeader.jsx** - Application header component

### State Management Pattern
- Uses React hooks for local state management
- Implements refresh pattern via `refreshKey` prop drilling from App → Dashboard
- Toast notifications handled through callback pattern (App provides `showToast` function to children)

### API Integration
- Environment-based API URL configuration via `VITE_API_BASE_URL` (defaults to http://localhost:3000)
- RESTful API calls for ticket CRUD operations
- Error handling with user-friendly messages

### Styling System
- **Tailwind CSS 4.1.16** for utility-first styling
- Responsive design patterns (md: breakpoints for desktop/mobile differences)
- Color-coded badges for categories and priorities
- Consistent focus states using indigo color scheme

### Testing Strategy
- **Vitest** with jsdom environment for React component testing
- **React Testing Library** for component interaction testing
- Mock API layer for isolated component testing
- Tests located in `src/__tests__/`

### Build System
- **Vite** as build tool and dev server
- ES modules throughout
- React plugin for JSX support
- PostCSS with Autoprefixer for CSS processing

## Environment Configuration

The application expects a backend API server and uses environment variables:
- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:3000)
- Copy `.env` to `.env.local` for local customization

## Data Models

### Ticket Structure
```javascript
{
  id: number,
  name: string,
  email: string,
  category: 'Network' | 'Security' | 'Cloud' | 'General',
  priority: 'Low' | 'Medium' | 'High' | 'Urgent',
  description: string,
  createdAt: string (ISO date)
}
```

### API Endpoints Expected
- `GET /api/tickets` - Fetch tickets with optional query params (category, priority, q)
- `POST /api/tickets` - Create new ticket

## Code Patterns

### Form Handling
- Controlled components with validation
- Email regex validation for email fields
- Minimum character requirements for descriptions
- Error state management per field

### Component Communication
- Props drilling for shared state
- Callback patterns for child-to-parent communication
- Effect cleanup patterns with ignore flags for async operations

### Responsive Design
- Desktop: Table layout for ticket display
- Mobile: Card-based layout
- Responsive grid systems using Tailwind CSS classes

### Error Handling
- Try-catch blocks for async operations
- User-friendly error messages via toast system
- Loading states for better UX during API calls