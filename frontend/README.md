# Notes App Frontend

A production-quality React + TypeScript notes application with markdown support, full CRUD functionality, tag management, and advanced filtering.

## Features

- **Full CRUD Operations**: Create, read, update, and delete notes with optimistic updates
- **Markdown Support**: Rich text editor with live preview and toolbar
- **Advanced Search**: Search by body text with optional title inclusion
- **Tag Management**: GitHub-style tag modal with filtering and creation
- **Server-Side Pagination**: Navigate through large note collections efficiently
- **Multi-select**: Select multiple notes with "Select All" functionality
- **Contract Testing**: Zod schema validation ensures frontend/backend compatibility
- **Optimistic Updates**: Instant UI updates with automatic rollback on errors
- **Responsive Design**: Clean, modern UI built with Tailwind CSS
- **Type Safety**: Strict TypeScript throughout with Zod runtime validation
- **Comprehensive Tests**: 91 test cases with Vitest + React Testing Library + MSW

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Build for production
npm run build

# Contract check (requires backend running)
npm run check-contract
```

## Environment Configuration

Create environment files based on `.env.example`:

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000/api

# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts          # API client with error handling
│   │   └── schemas.ts         # Zod schemas for runtime validation
│   ├── components/
│   │   ├── ErrorBoundary.tsx  # Error boundary component
│   │   ├── MarkdownView.tsx   # Markdown renderer with XSS protection
│   │   ├── NoteCard.tsx       # Individual note card with selection
│   │   ├── NoteList.tsx       # Note grid with select all
│   │   ├── NoteModal.tsx      # Create/edit modal with markdown
│   │   ├── Pagination.tsx     # Server-side pagination controls
│   │   ├── SearchBar.tsx      # Search with title toggle
│   │   ├── TagFilter.tsx      # Multi-select tag dropdown
│   │   └── TagModal.tsx       # GitHub-style tag management
│   ├── hooks/
│   │   └── useNotes.ts        # Notes hook with server-side pagination
│   ├── utils/
│   │   └── storage.ts         # LocalStorage helpers
│   ├── __tests__/
│   │   ├── mocks/
│   │   │   ├── handlers.ts    # MSW API handlers
│   │   │   └── server.ts      # MSW server setup
│   │   ├── setup.ts           # Test configuration
│   │   ├── NoteCard.test.tsx
│   │   ├── NoteCard.accessibility.test.tsx
│   │   ├── NoteList.test.tsx
│   │   ├── SearchBar.test.tsx
│   │   ├── TagFilter.test.tsx
│   │   ├── TagModal.test.tsx
│   │   ├── markdown.test.tsx
│   │   ├── pagination.test.tsx
│   │   └── useNotes.test.tsx
│   ├── types.ts               # TypeScript interfaces
│   ├── App.tsx                # Main application
│   ├── main.tsx               # Entry point
│   └── index.css              # Tailwind imports
├── scripts/
│   └── check-contract.ts      # API contract validation script
├── .env.example               # Environment template
├── .env.development           # Development config
├── .env.production            # Production config
├── .eslintrc.cjs              # ESLint configuration
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.cjs
```

## API Contract

The app expects a backend API with these endpoints:

### Notes
- `GET /notes/?body_text=<text>&title_text=<text>&tags=<tag1>&tags=<tag2>&page=<n>&page_size=<n>`
  - Returns: `{ items: Note[], total: number, page: number, page_size: number, total_pages: number }`
- `POST /notes/` - Create note
- `PUT /notes/{id}` - Update note
- `DELETE /notes/{id}` - Delete note

### Tags
- `GET /tags/` - List all tags
- `POST /tags/` - Create tag

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Zod** - Runtime type validation
- **@uiw/react-md-editor** - Markdown editor with toolbar
- **react-markdown** - Safe markdown rendering
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **MSW (Mock Service Worker)** - API mocking for tests

## Key Features Explained

### Contract Testing with Zod
All API responses are validated against Zod schemas at runtime. The contract check script (`npm run check-contract`) validates that a live API conforms to the expected schemas, catching breaking changes early.

### Server-Side Pagination
Pagination is handled by the backend, allowing efficient navigation through large datasets. The frontend tracks current page, page size, and total pages.

### Optimistic Updates
All create, update, and delete operations update the UI immediately and roll back if the API call fails, providing a smooth user experience even on slow networks.

### Markdown Support
Notes support full markdown syntax with:
- Live preview
- Rich text toolbar
- XSS protection via `react-markdown`
- Syntax highlighting for code blocks

### Search with Title Toggle
Search functionality filters by note content. When "Include title" is checked, the search also applies to note titles.

### Tag Management
GitHub-style tag modal allows:
- Viewing all available tags
- Filtering tags by typing
- Creating new tags inline
- Selecting/deselecting multiple tags

### Multi-selection
Notes can be selected individually or all at once. Selected notes can be batch deleted.

### Error Handling
- Zod schema validation for API responses
- Type-safe error handling with custom APIError class
- HTML escaping to prevent XSS
- Error banners for failed operations
- Automatic error recovery with rollback

## Testing

The test suite includes:
- **Unit tests** for hooks and utilities
- **Component tests** with React Testing Library
- **Integration tests** with MSW for API mocking
- **Accessibility tests** for ARIA compliance
- **91 total test cases** with high coverage

Run tests with:
```bash
npm test              # Run all tests
npm run test:ui       # Open Vitest UI
npm test -- --watch   # Watch mode
```

## Development

The app uses strict TypeScript mode and follows React best practices:
- Typed props for all components
- Custom hooks for state management
- Error boundaries for graceful error handling
- Accessible UI elements with ARIA attributes
- Comprehensive test coverage (91 tests)
- ESLint for code quality
- Mock Service Worker for reliable API testing

## CI/CD

GitHub Actions workflow runs on every push/PR:
- **Linting** - ESLint checks
- **Type checking** - TypeScript compilation
- **Tests** - Full test suite (91 tests)
- **Build** - Production build verification

## Production Notes

This is a demonstration/portfolio project. For production use, consider:
- Authentication and authorization
- Rate limiting
- Error tracking (Sentry, etc.)
- Analytics
- CDN for static assets
- Environment-specific configurations
