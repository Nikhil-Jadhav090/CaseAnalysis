# Django backend for Case Analysis System

## Setup Instructions

1. Create and activate virtual environment:
```powershell
python -m venv venv
.\venv\Scripts\activate
```

2. Install dependencies:
```powershell
pip install -r requirements.txt
```

3. Create .env file with following variables:
```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=case_analysis
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=3306
GEMINI_API_KEY=your-gemini-api-key
```

4. Create MySQL database:
```sql
CREATE DATABASE case_analysis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. Run migrations:
```powershell
python manage.py makemigrations
python manage.py migrate
```

6. Create superuser:
```powershell
python manage.py createsuperuser
```

7. Run development server:
```powershell
python manage.py runserver
```

## API Endpoints

### Authentication
- POST /api/auth/register/ - Register new user
- POST /api/auth/login/ - Login user
- POST /api/auth/refresh/ - Refresh JWT token
- POST /api/auth/password-reset/ - Request password reset
- POST /api/auth/password-reset/confirm/ - Confirm password reset

### Users
- GET /api/users/ - List users (admin only)
- GET /api/users/{id}/ - Get user details
- PUT /api/users/{id}/ - Update user
- DELETE /api/users/{id}/ - Delete user

### Cases
- GET /api/cases/ - List cases
- POST /api/cases/ - Create case
- GET /api/cases/{id}/ - Get case details
- PUT /api/cases/{id}/ - Update case
- DELETE /api/cases/{id}/ - Delete case
- POST /api/cases/{id}/analyze/ - Run AI analysis on existing case
- POST /api/cases/analyze_upload/ - **NEW** Run AI analysis with file uploads (no case ID required)

### Case Analysis (NEW Endpoint)
**POST /api/cases/analyze_upload/** 
- **Purpose**: Analyze case details with evidence/audio files without creating a case
- **Content-Type**: multipart/form-data
- **Required Fields**:
  - `title` (string): Case title
  - `description` (string): Case description
- **Optional Fields**:
  - `accused_name` (string): Name of accused person
  - `evidence_files` (file[]): PDF, DOC, DOCX, TXT files
  - `audio_files` (file[]): MP3, WAV audio files
- **Headers**:
  - `Authorization: Bearer <jwt_token>` (required if not anonymous)
- **Response**: JSON with AI analysis
  ```json
  {
    "keywords": ["keyword1", "keyword2"],
    "sentiment": 0.5,
    "category_confidence": {
      "general": 0.8,
      "fraud": 0.2,
      "security": 0.1,
      "compliance": 0.05,
      "financial": 0.15
    },
    "summary": "Brief case summary..."
  }
  ```

### Chat
- POST /api/chat/query/ - Send query to Gemini AI
- GET /api/chat/history/ - Get chat history