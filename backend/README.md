# Notes Backend API

A Django-based REST API for a notes application with tagging support. Built with Django 5.x, Django Ninja, and SQLite.

## Features

- Full CRUD operations for notes
- Tag management with automatic normalization (lowercase, stripped)
- Advanced search and filtering (by title, content, tags)
- Tag intersection search (find notes with ALL specified tags)
- Comprehensive test suite
- CORS support for frontend integration

## Tech Stack

- Python 3.11+
- Django 5.x
- Django Ninja (REST API framework)
- SQLite database
- django-cors-headers

## Project Structure

```
backend/
├── manage.py
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── notes/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py
│   ├── schemas.py
│   ├── api.py
│   ├── migrations/
│   │   └── __init__.py
│   └── tests/
│       ├── __init__.py
│       └── test_api.py
├── requirements.txt
└── README.md
```

## Setup and Installation

### 1. Create and activate virtual environment

**Linux/Mac:**
```bash
python -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run database migrations

```bash
python manage.py migrate
```

### 4. (Optional) Create a superuser for admin access

```bash
python manage.py createsuperuser
```

### 5. Run the development server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Notes

#### `GET /api/notes/`
List all notes with optional filtering.

**Query Parameters:**
- `body_text` (optional): Filter by content substring (case-insensitive)
- `title_text` (optional): Filter by title substring (case-insensitive)
- When both `body_text` and `title_text` are provided, uses **OR logic** (returns notes matching either field)
- `tags` (optional, multiple): Filter by tag names (OR semantics - returns notes with at least one of the specified tags)

**Example:**
```bash
# Get all notes
curl http://localhost:8000/api/notes/

# Filter by content
curl http://localhost:8000/api/notes/?body_text=Django

# Filter by title
curl http://localhost:8000/api/notes/?title_text=Tutorial

# Filter by title OR content (returns notes with "greg" in title OR content)
curl http://localhost:8000/api/notes/?body_text=greg&title_text=greg

# Filter by tags (notes with python OR tutorial tags)
curl http://localhost:8000/api/notes/?tags=python&tags=tutorial

# Combine text and tag filters
curl http://localhost:8000/api/notes/?title_text=Guide&tags=django
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "My Note",
    "content": "Note content here",
    "tags": ["work", "important"],
    "created_at": "2025-12-09T10:00:00Z",
    "updated_at": "2025-12-09T10:00:00Z"
  }
]
```

#### `GET /api/notes/{id}`
Get a single note by ID.

**Example:**
```bash
curl http://localhost:8000/api/notes/1
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "My Note",
  "content": "Note content here",
  "tags": ["work", "important"],
  "created_at": "2025-12-09T10:00:00Z",
  "updated_at": "2025-12-09T10:00:00Z"
}
```

**Error Response:** `404 Not Found` if note doesn't exist

#### `POST /api/notes/`
Create a new note.

**Request Body:**
```json
{
  "title": "My New Note",
  "content": "This is the content of my note.",
  "tags": ["work", "urgent"]
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "title": "My New Note",
  "content": "This is the content of my note.",
  "tags": ["work", "urgent"],
  "created_at": "2025-12-09T10:00:00Z",
  "updated_at": "2025-12-09T10:00:00Z"
}
```

#### `PUT /api/notes/{id}`
Update an existing note.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content.",
  "tags": ["work"]
}
```

**Response:** `200 OK` with updated note data

#### `DELETE /api/notes/{id}`
Delete a note.

**Response:** `204 No Content`

### Tags

#### `GET /api/tags/`
List all tags sorted by name.

**Response:**
```json
[
  {
    "id": 1,
    "name": "work"
  },
  {
    "id": 2,
    "name": "personal"
  }
]
```

#### `POST /api/tags/`
Create a new tag or return existing one.

**Request Body:**
```json
{
  "name": "NewTag"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "newtag"
}
```

**Note:** Tag names are automatically normalized (lowercased and trimmed). Creating a tag with a name that already exists returns the existing tag.

## Data Model

### Note
- `id`: Primary key
- `title`: String (max 200 chars, required)
- `content`: Text (max 10,000 chars, required)
- `tags`: Many-to-many relationship with Tag
- `created_at`: Timestamp (auto-set on creation)
- `updated_at`: Timestamp (auto-updated on save)

### Tag
- `id`: Primary key
- `name`: String (max 100 chars, unique, normalized)

**Tag Normalization:** All tag names are automatically:
- Stripped of leading/trailing whitespace
- Converted to lowercase
- Deduplicated

Example: `[" Work ", "work", "WORK"]` → `["work"]`

## Validation Rules

### Notes
- `title`: Required, non-empty after trimming, max 200 characters
- `content`: Required, non-empty after trimming, max 10,000 characters
- `tags`: Optional array of strings, automatically normalized and deduplicated

### Tags
- `name`: Required, non-empty after trimming, max 100 characters

## Running Tests

Run the full test suite:

```bash
python manage.py test
```

Run tests for a specific app:

```bash
python manage.py test notes
```

Run tests with verbose output:

```bash
python manage.py test --verbosity=2
```

### Test Coverage

The test suite covers:
- Note CRUD operations
- Tag creation and normalization
- Search and filtering (title, content, tags)
- Tag intersection searches
- Validation (empty fields, max lengths)
- Edge cases (duplicate tags, shared tags across notes)

## Production Deployment

For production deployment, use a WSGI server like Gunicorn:

### Install Gunicorn
```bash
pip install gunicorn
```

### Run with Gunicorn
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

### Production Checklist

Before deploying to production:

1. **Change SECRET_KEY** in `config/settings.py`
2. **Set DEBUG = False** in `config/settings.py`
3. **Configure ALLOWED_HOSTS** properly
4. **Use PostgreSQL or MySQL** instead of SQLite
5. **Set up static file serving** with a reverse proxy (nginx/Apache)
6. **Enable HTTPS** with SSL certificates
7. **Configure proper CORS settings** for your frontend domain
8. **Set up database backups**
9. **Configure logging** for production monitoring
10. **Use environment variables** for sensitive settings

### Example Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /path/to/staticfiles/;
    }
}
```

## CORS Configuration

The backend is configured to accept requests from `http://localhost:5173` (Vite dev server) by default.

To add additional origins, edit `config/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://your-production-domain.com',
]
```

## Admin Interface

Django's admin interface is available at `http://localhost:8000/admin/`

To access it:
1. Create a superuser: `python manage.py createsuperuser`
2. Start the server and navigate to the admin URL
3. Log in with your superuser credentials

## Development

### Adding New Endpoints

1. Define schemas in `notes/schemas.py`
2. Implement endpoint logic in `notes/api.py`
3. Add tests in `notes/tests/test_api.py`

### Database Migrations

After modifying models:

```bash
python manage.py makemigrations
python manage.py migrate
```

## API Documentation

Django Ninja provides automatic API documentation.

When running the development server, visit:
- Swagger UI: `http://localhost:8000/api/docs`
- OpenAPI Schema: `http://localhost:8000/api/openapi.json`

## Troubleshooting

### Port already in use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
python manage.py runserver 8001
```

### Database locked error
SQLite can have locking issues with concurrent access. Consider using PostgreSQL for production or high-concurrency scenarios.

### CORS errors
Ensure your frontend origin is listed in `CORS_ALLOWED_ORIGINS` in settings.py.

## License

This project is provided as-is for educational and development purposes.
