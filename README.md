# Notetaker API

Notetaker API is a backend system written in python using FastAPI acting as a notes storage server. It implements the ability to create read update and delete personal notes. Users must first register and authenticate to get a session token which then can be used to access the CRUD actions for their personal notes.

## Features

- **User Registration**: Create a new account with username, email, and password
- **User Authentication**: Login to receive a JWT token
- **CRUD Operations**: Create, read, update, and delete personal notes
- **Token-based Security**: All note operations require a valid JWT token
- **SQLAlchemy ORM**: SQLite database with proper relationships

## Project Structure

```
notetaker/
├── app/
│   ├── core/
│   │   ├── config.py          # Configuration settings
│   │   ├── database.py        # Database setup
│   │   └── security.py        # JWT and password hashing
│   ├── models/
│   │   ├── user.py           # User database model
│   │   └── note.py           # Note database model
│   ├── routes/
│   │   ├── auth.py           # Authentication endpoints
│   │   └── notes.py          # CRUD endpoints for notes
│   ├── schemas/
│   │   ├── user.py           # User Pydantic schemas
│   │   └── note.py           # Note Pydantic schemas
│   └── __init__.py
├── main.py                    # Application entry point
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables
└── README.md
```

## Installation

1. **Clone the repository**:
   ```bash
   cd /home/alex/Repositories/notetaker
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (optional for development)

## Running the Server

Start the development server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- **Interactive API docs (Swagger UI)**: http://localhost:8000/docs
- **Alternative API docs (ReDoc)**: http://localhost:8000/redoc

## API Endpoints

### Authentication

- **Register**: `POST /auth/register`
  - Body: `{"username": "user", "password": "pass123"}`
  - Returns: User object with id, username

- **Login**: `POST /auth/login`
  - Body: `{"username": "user", "password": "pass123"}`
  - Returns: `{"access_token": "token_here", "token_type": "bearer"}`

### Notes (require Authorization header with token)

All endpoints require the header: `Authorization: Bearer <your_token>`

- **Create Note**: `POST /notes/`
  - Body: `{"title": "My Note", "content": "Note content here"}`
  - Returns: Note object

- **List Notes**: `GET /notes/`
  - Returns: List of all user's notes

- **Get Note**: `GET /notes/{note_id}`
  - Returns: Single note object

- **Update Note**: `PUT /notes/{note_id}`
  - Body: `{"title": "Updated Title", "content": "Updated content"}` (fields optional)
  - Returns: Updated note object

- **Delete Note**: `DELETE /notes/{note_id}`
  - Returns: 204 No Content

## Usage Example

```bash
# 1. Register a user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "password123"}'

# 2. Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "password123"}'

# Save the access_token from the response

# 3. Create a note (replace TOKEN with your token)
curl -X POST http://localhost:8000/notes/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title": "My First Note", "content": "This is the content of my note"}'

# 4. List notes
curl -X GET http://localhost:8000/notes/ \
  -H "Authorization: Bearer TOKEN"

# 5. Update a note (replace NOTE_ID with the note id)
curl -X PUT http://localhost:8000/notes/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title": "Updated Title"}'

# 6. Delete a note
curl -X DELETE http://localhost:8000/notes/1 \
  -H "Authorization: Bearer TOKEN"
```

## Environment Variables

- `DATABASE_URL`: Database connection string (default: sqlite:///./notetaker.db)
- `SECRET_KEY`: Secret key for JWT encoding (change in production)
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default: 30)
- `DEBUG`: Debug mode (default: True)

## Security Notes

⚠️ **Important for Production**:
- Change `SECRET_KEY` in `.env` to a strong, random value
- Use a production database (PostgreSQL, MySQL) instead of SQLite
- Set `DEBUG=False`
- Use HTTPS
- Implement rate limiting
- Add CORS restrictions

## Future Enhancements

- Note sharing and collaboration
- Note categories/tags
- Full-text search
- Webhooks for note changes
- File attachments to notes
- Rich text editor support
- Two-factor authentication