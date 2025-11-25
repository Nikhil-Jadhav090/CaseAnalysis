# Case Analysis System

A comprehensive legal case management and AI-powered analysis platform built with Django REST Framework and React.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 📝 **7-Step Case Creation Wizard** - Guided case information collection
- 🤖 **AI-Powered Analysis** - Comprehensive legal analysis using Google Gemini AI covering:
  - Justice Pathway
  - Police Action Required
  - FIR Filing Guide
  - Protection & Safety Measures
  - Legal Guidance
  - Compensation Information
  - Case Analysis Report
- 📄 **PDF Export** - Download professional case analysis reports
- 💬 **Chat System** - AI-assisted case discussions
- 📁 **Document Management** - Upload and manage case documents
- 👥 **User Management** - Admin and user role-based access

## Tech Stack

### Backend
- Django 5.0
- Django REST Framework
- MySQL / SQLite
- Google Gemini AI
- JWT Authentication

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion (animations)
- jsPDF + html2canvas (PDF generation)
- Lucide React (icons)

## Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL (optional, falls back to SQLite)
- Google Gemini API Key

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/CaseAnalysis.git
cd CaseAnalysis
```

### 2. Backend Setup

```powershell
# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend/requirements.txt

# Create .env file in backend directory
# Add the following variables:
# GEMINI_API_KEY=your_gemini_api_key
# DB_NAME=your_db_name (optional)
# DB_USER=your_db_user (optional)
# DB_PASSWORD=your_db_password (optional)
# DB_HOST=localhost (optional)
# DB_PORT=3306 (optional)

# Run migrations
cd backend
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```powershell
# Install dependencies
cd frontend
npm install

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Required
GEMINI_API_KEY=your_google_gemini_api_key

# Optional (for MySQL)
DB_NAME=case_analysis_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=3306

# If DB variables are not set, SQLite will be used automatically
```

## Project Structure

```
CaseAnalysis/
├── backend/
│   ├── cases/          # Case management API
│   ├── chat/           # Chat system API
│   ├── users/          # User authentication & management
│   ├── core/           # Django settings & configuration
│   ├── media/          # Uploaded documents
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React context (Auth)
│   │   ├── pages/      # Application pages
│   │   └── App.jsx
│   └── package.json
└── scripts/            # Utility scripts
```

## API Endpoints

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/token/refresh/` - Refresh JWT token

### Cases
- `GET /api/cases/` - List all cases
- `POST /api/cases/` - Create new case
- `GET /api/cases/{id}/` - Get case details
- `POST /api/cases/{id}/analyze/` - AI analysis
- `POST /api/cases/{id}/upload_document/` - Upload document
- `POST /api/cases/{id}/add_comment/` - Add comment
- `POST /api/cases/{id}/close/` - Close case

### Chat
- `GET /api/chat/sessions/` - List chat sessions
- `POST /api/chat/sessions/` - Create chat session
- `POST /api/chat/sessions/{id}/messages/` - Send message

## Usage

1. **Register/Login**: Create an account or login at `/login`
2. **Create Case**: Click "New Case" and follow the 7-step wizard
3. **AI Analysis**: After case creation, the AI automatically analyzes the case
4. **View Analysis**: Navigate to case details to see comprehensive 7-section analysis
5. **Download PDF**: Click "Download PDF" to export analysis report
6. **Chat**: Use the chat feature for AI-assisted discussions

## Deployment

### Backend (Django)
- Use Gunicorn/uWSGI for production
- Configure allowed hosts in `settings.py`
- Set up static file serving
- Use PostgreSQL/MySQL for production database

### Frontend (React)
- Run `npm run build` to create production build
- Serve the `dist/` folder with Nginx/Apache
- Update API endpoints to production URL

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Google Gemini AI for analysis capabilities
- Django & React communities
- All contributors
