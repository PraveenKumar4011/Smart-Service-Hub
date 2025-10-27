# Smart Service Hub (Frontend)

Single-page application built with Vite + React and Tailwind CSS.

## Requirements
- Node.js 18+
- Backend API available at `VITE_API_BASE_URL` (default: `http://localhost:3000`)

## Getting Started
```bash
# install deps
npm install

# configure API
cp .env .env.local  # optional; edit VITE_API_BASE_URL if needed

# start dev server
npm run dev
```

The dev server runs at http://localhost:5173.

## Testing
```bash
npm test
```

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview built app
- `npm run lint` — run ESLint
- `npm test` — run unit tests (Vitest + RTL)
