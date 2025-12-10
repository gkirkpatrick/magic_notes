# Notes Application

[![Backend CI](https://github.com/gkirkpatrick/magic_notes/actions/workflows/ci.yml/badge.svg)](https://github.com/gkirkpatrick/magic_notes/actions/workflows/ci.yml)

A full-stack notes application with markdown support, tagging, search, and server-side pagination. Built as a demonstration of modern web development practices with comprehensive testing and CI/CD.

> **⚠️ IMPORTANT: This is a demonstration/portfolio project and NOT production-ready.**
>
> Before using in production, you would need to address:
> - **Authentication & Authorization**: No user authentication or multi-tenancy
> - **Security hardening**: SECRET_KEY management, HTTPS enforcement, rate limiting
> - **Database**: Production-grade database (PostgreSQL/MySQL) instead of SQLite
> - **Monitoring & logging**: Error tracking, performance monitoring
> - **Infrastructure**: Load balancing, auto-scaling, health checks

## Features

### Core Functionality
- **Full CRUD Operations** - Create, read, update, and delete notes
- **Markdown Support** - Rich text editor with live preview and toolbar
- **Tagging System** - Organize notes with multiple tags
- **Search & Filter** - Full-text search across titles and content, filter by tags
- **Server-Side Pagination** - Efficient navigation through large note collections
- **View Modes** - Switch between card and list views
- **Multi-select** - Batch operations on multiple notes
- **Responsive Design** - Works on desktop and mobile devices

### Technical Features
- **Type Safety** - TypeScript throughout with Zod runtime validation
- **Contract Testing** - Automated validation of API contracts
- **XSS Protection** - Sanitized markdown rendering
- **Optimistic Updates** - Instant UI feedback with rollback on error
- **Accessibility** - Keyboard navigation and ARIA support
- **Comprehensive Testing** - 129 test cases (38 backend + 91 frontend)
- **CI/CD Pipeline** - Automated linting, testing, and contract validation
- **Code Quality** - ESLint, Black, Flake8 for consistent code style

## Tech Stack

### Frontend
- **React 18** - UI framework with hooks
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Zod** - Runtime type validation
- **@uiw/react-md-editor** - Markdown editor with toolbar
- **react-markdown** - Safe markdown rendering
- **Vitest + React Testing Library** - 91 tests
- **MSW (Mock Service Worker)** - API mocking for tests

### Backend
- **Django 5.x** - Web framework
- **Django Ninja** - Fast, type-safe REST API
- **Pydantic** - Data validation
- **SQLite** - Database (demo only - use PostgreSQL for production)
- **Python 3.11+** - Programming language

## Installation

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.11+** and pip
- **Git**

### Quick Start (Recommended)

Run the automated setup script that handles everything:

```bash
./dev.sh
```

This script will:
- Create and activate a Python virtual environment
- Install all backend dependencies
- Run database migrations
- Prompt to create a Django superuser (optional)
- Install all frontend dependencies
- Create .env files if needed
- Start both backend (port 8000) and frontend (port 5173) servers

Press `Ctrl+C` to stop both servers.

### Manual Setup

If you prefer to set up manually:

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

The backend API will be available at `http://localhost:8000/api`

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Copy and configure environment variables:
   ```bash
   cp .env.example .env.development
   # Edit .env.development if needed (default: http://localhost:8000/api)
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Create a Note**: Click the "New Note" button, enter a title and content (with markdown), add tags, and save
2. **Edit a Note**: Click on any note card to open the editor
3. **Search**: Use the search bar to filter notes by title or content
4. **Filter by Tags**: Click the tag filter dropdown to filter notes by specific tags
5. **Pagination**: Navigate through pages using the pagination controls
6. **Delete Notes**: Select notes using checkboxes and click the delete button
7. **Switch Views**: Toggle between card and list views using the view switcher

## Testing

### Frontend Tests (91 tests)
```bash
cd frontend
npm test                # Run all tests
npm run test:ui         # Open Vitest UI
npm test -- --watch     # Watch mode
```

### Backend Tests (38 tests)
```bash
cd backend
python manage.py test
```

### Contract Testing
Validates that the API conforms to the frontend's Zod schemas:
```bash
cd frontend
npm run check-contract  # Backend must be running on localhost:8000
```

## API Endpoints

### Notes
- `GET /api/notes/` - List notes with pagination, search, and filtering
  - Query params: `body_text`, `title_text`, `tags`, `page`, `page_size`
  - Returns: `{ items: Note[], total: number, page: number, page_size: number, total_pages: number }`
- `POST /api/notes/` - Create a new note
- `GET /api/notes/{id}/` - Get a specific note
- `PUT /api/notes/{id}/` - Update a note
- `DELETE /api/notes/{id}/` - Delete a note

### Tags
- `GET /api/tags/` - List all tags
- `POST /api/tags/` - Create a new tag (returns existing if duplicate)

See [backend/README.md](backend/README.md) for detailed API documentation.

## Project Structure

```
magic_notes/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── backend/                    # Django backend
│   ├── notes/                  # Notes app
│   │   ├── api.py             # API endpoints
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── admin.py           # Django admin configuration
│   │   └── tests/             # Backend tests (38 tests)
│   ├── config/                # Django settings
│   └── requirements.txt
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── api/               # API client + Zod schemas
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utility functions
│   │   └── __tests__/         # Frontend tests (91 tests)
│   ├── scripts/
│   │   └── check-contract.ts  # Contract validation
│   ├── .env.example
│   └── package.json
└── README.md
```

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and PR:

### Jobs
1. **Backend Tests & Linting** (Python 3.12)
   - Flake8 linting
   - Black code formatting check
   - Django tests (38 tests)
   - Migration checks

2. **Frontend Tests & Linting** (Node 20.x)
   - ESLint checks
   - TypeScript compilation
   - Vitest tests (91 tests)
   - Production build verification

3. **Contract Check** (runs after both pass)
   - Starts Django backend with SQLite
   - Runs frontend contract validation
   - Validates API responses match Zod schemas

All jobs must pass before merging to main.

## Development

### Code Quality Standards

**Backend:**
- Flake8 for linting (120 char line limit)
- Black for code formatting (120 char line limit)
- Type hints encouraged
- 38 test cases covering CRUD, pagination, validation, and edge cases

**Frontend:**
- ESLint with TypeScript rules
- Strict TypeScript mode
- Zod for runtime validation
- 91 test cases with MSW

### Contributing Guidelines

1. Run tests locally before committing
2. Follow existing code style
3. Add tests for new features
4. Update documentation as needed

## Architecture Highlights

### Contract Testing
The frontend defines Zod schemas that mirror the backend's Pydantic schemas. The contract check script validates that a live API conforms to these schemas, catching breaking changes early in development.

### Server-Side Pagination
Pagination is handled by the backend using Django's `Paginator`, allowing efficient queries on large datasets. The frontend receives paginated results with metadata (total count, page numbers).

### Optimistic Updates
Create, update, and delete operations update the UI immediately. If the API call fails, changes are rolled back automatically, providing a smooth UX even on slow networks.

### Type Safety End-to-End
- Backend: Pydantic schemas validate request/response data
- API: Django Ninja provides OpenAPI-compatible endpoints
- Frontend: Zod schemas validate runtime data + TypeScript for compile-time safety

## Production Considerations

This is a **demonstration project**. For production use:

### Security
- [ ] Add authentication (JWT, OAuth, etc.)
- [ ] Implement authorization and multi-tenancy
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/SSL
- [ ] Add rate limiting
- [ ] Implement CSRF protection beyond Django defaults

### Database
- [ ] Switch to PostgreSQL or MySQL
- [ ] Set up connection pooling
- [ ] Configure backups
- [ ] Add database indexes for performance

### Monitoring & Logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Add application monitoring (New Relic, DataDog)
- [ ] Implement structured logging
- [ ] Set up health checks

### Infrastructure
- [ ] Deploy with Docker/Kubernetes
- [ ] Set up load balancing
- [ ] Configure auto-scaling
- [ ] Use CDN for static assets
- [ ] Set up staging environment

## License

MIT

## Acknowledgments

Built with modern best practices for full-stack development, including comprehensive testing, CI/CD automation, and contract-driven development.
