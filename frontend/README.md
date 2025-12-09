# Notes App Frontend

A production-quality React + TypeScript notes application with full CRUD functionality, tag management, and advanced filtering.

## Features

- **Full CRUD Operations**: Create, read, update, and delete notes
- **Advanced Search**: Search by body text with optional title inclusion
- **Tag Management**: GitHub-style tag modal with filtering and creation
- **Multi-select**: Select multiple notes with "Select All" functionality
- **Optimistic Updates**: Instant UI updates with automatic rollback on errors
- **Responsive Design**: Clean, modern UI built with Tailwind CSS
- **Type Safety**: Strict TypeScript throughout
- **Comprehensive Tests**: Full test coverage with Vitest + React Testing Library

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Build for production
npm build
```

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts          # API client with proper query string handling
│   ├── components/
│   │   ├── NoteCard.tsx       # Individual note card with selection
│   │   ├── NoteList.tsx       # Note grid with select all
│   │   ├── NoteModal.tsx      # Create/edit modal
│   │   ├── SearchBar.tsx      # Search with title toggle
│   │   ├── TagFilter.tsx      # Multi-select tag dropdown
│   │   └── TagModal.tsx       # GitHub-style tag management
│   ├── hooks/
│   │   └── useNotes.ts        # Notes hook with optimistic updates
│   ├── __tests__/
│   │   ├── setup.ts           # Test configuration
│   │   ├── NoteCard.test.tsx
│   │   ├── NoteList.test.tsx
│   │   ├── TagFilter.test.tsx
│   │   ├── TagModal.test.tsx
│   │   └── useNotes.test.tsx
│   ├── types.ts               # TypeScript interfaces
│   ├── App.tsx                # Main application
│   ├── main.tsx               # Entry point
│   └── index.css              # Tailwind imports
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.cjs
```

## API Contract

The app expects a backend API at `http://localhost:8000/api` with these endpoints:

- `GET /notes/?body_text=<text>&title_text=<text>&tags=<tag1>&tags=<tag2>`
- `POST /notes/`
- `PUT /notes/{id}`
- `DELETE /notes/{id}`
- `GET /tags/`
- `POST /tags/`

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Vitest** - Testing framework
- **React Testing Library** - Component testing

## Key Features Explained

### Optimistic Updates
All create, update, and delete operations update the UI immediately and roll back if the API call fails, providing a smooth user experience.

### Search with Title Toggle
Search functionality allows filtering by note content. When "Include title" is checked, the search also applies to note titles.

### Tag Management
GitHub-style tag modal allows:
- Viewing all available tags
- Filtering tags by typing
- Creating new tags inline
- Selecting/deselecting multiple tags

### Multi-selection
Notes can be selected individually or all at once. Selected notes can be batch deleted.

### Error Handling
- Defensive API response parsing
- HTML escaping to prevent XSS
- Error banners for failed operations
- Automatic error recovery

## Development

The app uses strict TypeScript mode and follows React best practices:
- Typed props for all components
- Custom hooks for state management
- Proper error boundaries
- Accessible UI elements
- Comprehensive test coverage
