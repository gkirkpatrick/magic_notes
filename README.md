# Notes Application

A full-stack notes application with markdown support, tagging, and search functionality.

## Features

### Core Functionality
- **Create, Read, Update, Delete (CRUD)** operations for notes
- **Markdown Support** with live preview and rich text toolbar
- **Tagging System** - Organize notes with multiple tags
- **Search** - Full-text search across note titles and content
- **Filtering** - Filter notes by tags
- **View Modes** - Switch between card and list views
- **Pagination** - Navigate through large note collections
- **Responsive Design** - Works on desktop and mobile devices

### Technical Features
- **XSS Protection** - Sanitized markdown rendering
- **Optimistic Updates** - Instant UI feedback with rollback on error
- **Accessibility** - Keyboard navigation and ARIA support
- **Persistent Storage** - LocalStorage fallback for offline use
- **Comprehensive Testing** - 85+ test cases

## Tech Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **@uiw/react-md-editor** - Markdown editor with toolbar
- **react-markdown** - Markdown rendering
- **Vitest** - Testing framework

### Backend
- **Django** - Web framework
- **Django Ninja** - REST API
- **SQLite** - Database

## Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- pip

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
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

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Create a Note**: Click the "New Note" button, enter a title and content (with markdown), add tags, and save
2. **Edit a Note**: Click on any note card to open the editor
3. **Search**: Use the search bar to filter notes by title or content
4. **Filter by Tags**: Click the tag filter dropdown to filter notes by specific tags
5. **Delete Notes**: Select notes using checkboxes and click the delete button
6. **Switch Views**: Toggle between card and list views using the view switcher

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
python manage.py test
```

## API Endpoints

- `GET /api/notes/` - List all notes (with pagination, search, and filtering)
- `POST /api/notes/` - Create a new note
- `GET /api/notes/{id}/` - Get a specific note
- `PUT /api/notes/{id}/` - Update a note
- `DELETE /api/notes/{id}/` - Delete a note
- `GET /api/tags/` - List all tags
- `POST /api/tags/` - Create a new tag

## Project Structure

```
crud_notes/
├── backend/           # Django backend
│   ├── notes/        # Notes app
│   └── crud_notes/   # Django project settings
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── __tests__/     # Test files
│   └── public/
└── README.md
```

## License

MIT
