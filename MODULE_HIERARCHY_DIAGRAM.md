# Module Hierarchy Diagram - Case Analysis System

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Case Analysis System                          │
│                   (Full Stack Application)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
    ┌──────────────────┐            ┌──────────────────┐
    │  Frontend Layer  │◄──────────►│  Backend Layer   │
    │   (React App)    │   REST API │  (Django DRF)    │
    └──────────────────┘            └──────────────────┘
              │                               │
              │                               │
              ▼                               ▼
    [User Interface]              [Business Logic & Data]
```

---

## 1. Frontend Module Hierarchy

### 1.1 Root Level
```
frontend/
├── index.html                 # Application entry point
├── package.json              # Dependencies & scripts
├── vite.config.js           # Vite bundler configuration
├── tailwind.config.cjs      # Tailwind CSS configuration
└── postcss.config.cjs       # PostCSS configuration
```

### 1.2 Source Code Structure (`src/`)

```
src/
├── main.jsx                  # React application bootstrap
├── App.jsx                   # Root component with routing
├── index.css                # Global styles & Tailwind imports
├── config.js                # API configuration & endpoints
│
├── components/              # Reusable UI Components
│   ├── Navbar.jsx          # Navigation bar with auth
│   ├── Footer.jsx          # Site footer
│   ├── Logo.jsx            # Brand logo component
│   └── ProtectedRoute.jsx  # Route guard component
│
├── pages/                   # Page Components (Routes)
│   ├── Landing.jsx         # Home/Landing page
│   ├── Login.jsx           # User login
│   ├── Register.jsx        # User registration
│   ├── Dashboard.jsx       # User dashboard
│   ├── CaseCreate.jsx      # Create new case
│   ├── CaseCreated.jsx     # Case creation success
│   ├── CaseAnalysis.jsx    # AI case analysis
│   ├── CaseDetails.jsx     # View case details
│   ├── ChatAssistant.jsx   # AI chat interface
│   ├── AdminDashboard.jsx  # Admin overview
│   └── AdminPage.jsx       # Admin management
│
└── context/                 # React Context API
    └── AuthContext.jsx     # Authentication state management
```

### 1.3 Frontend Module Dependencies

```
┌─────────────────────────────────────────────┐
│           React Application (main.jsx)       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│              App.jsx (Router)                │
│  ┌─────────────────────────────────────┐   │
│  │      AuthContext Provider            │   │
│  │  (Global Authentication State)       │   │
│  └─────────────────────────────────────┘   │
└─────────────────┬───────────────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
  ┌────────┐ ┌────────┐ ┌──────────┐
  │ Navbar │ │ Routes │ │  Footer  │
  └────────┘ └───┬────┘ └──────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌────────┐  ┌─────────┐  ┌──────────┐
│ Public │  │Protected│  │  Admin   │
│ Pages  │  │  Pages  │  │  Pages   │
└────────┘  └─────────┘  └──────────┘
    │            │            │
    ▼            ▼            ▼
Landing      Dashboard    AdminDash
Login        Cases        AdminPage
Register     Chat
             Analysis
```

---

## 2. Backend Module Hierarchy

### 2.1 Root Level
```
backend/
├── manage.py                 # Django management script
├── requirements.txt         # Python dependencies
├── db.sqlite3              # SQLite database (dev)
├── Procfile                # Deployment configuration
├── build_files.sh          # Build script
└── wsgi_vercel.py         # WSGI handler for Vercel
```

### 2.2 Core Module (`core/`)

```
core/                        # Project Configuration
├── __init__.py
├── settings.py             # Django settings
│   ├── Database Config
│   ├── CORS Settings
│   ├── JWT Settings
│   ├── Static Files
│   ├── Media Files
│   └── AI (Gemini) Config
├── urls.py                 # URL routing
├── wsgi.py                # WSGI application
└── asgi.py                # ASGI application
```

**Core Module Responsibilities:**
```
settings.py
├── INSTALLED_APPS
│   ├── Django Built-ins
│   ├── rest_framework
│   ├── rest_framework_simplejwt
│   ├── corsheaders
│   ├── users (Custom)
│   ├── cases (Custom)
│   └── chat (Custom)
│
├── MIDDLEWARE
│   ├── SecurityMiddleware
│   ├── CorsMiddleware
│   ├── SessionMiddleware
│   ├── AuthenticationMiddleware
│   └── WhiteNoiseMiddleware
│
├── DATABASES
│   ├── MySQL (Production)
│   └── SQLite (Development)
│
└── REST_FRAMEWORK
    ├── DEFAULT_AUTHENTICATION_CLASSES
    │   └── JWTAuthentication
    └── DEFAULT_PERMISSION_CLASSES
        └── IsAuthenticated
```

### 2.3 Users Module (`users/`)

```
users/
├── __init__.py
├── apps.py                 # App configuration
├── models.py              # User model
│   └── User (Custom)
│       ├── email (unique)
│       ├── first_name
│       ├── last_name
│       ├── role (user/admin)
│       ├── is_active
│       └── date_joined
│
├── serializers.py         # Data serialization
│   ├── UserSerializer
│   └── RegisterSerializer
│
├── views.py              # API endpoints
│   ├── RegisterView
│   ├── LoginView (JWT)
│   └── UserProfileView
│
├── urls.py               # URL routing
└── migrations/           # Database migrations
```

**Users Module Flow:**
```
API Request → urls.py → views.py → serializers.py → models.py → Database
     ↓
JWT Token Generation/Validation
     ↓
Response with User Data + Token
```

### 2.4 Cases Module (`cases/`)

```
cases/
├── __init__.py
├── apps.py               # App configuration
├── models.py            # Case model
│   └── Case
│       ├── case_id (auto-generated)
│       ├── title
│       ├── description
│       ├── status
│       ├── priority
│       ├── category
│       ├── owner (FK → User)
│       ├── assigned_to (FK → User)
│       ├── created_at
│       ├── updated_at
│       ├── AI Analysis Fields:
│       │   ├── analysis_summary
│       │   ├── analysis_confidence
│       │   ├── analysis_category
│       │   ├── legal_precedents
│       │   ├── recommended_actions
│       │   └── evidence_analysis
│       └── Case Details:
│           ├── incident_date
│           ├── location
│           ├── parties_involved
│           ├── evidence_collected
│           └── documents
│
├── serializers.py       # Data serialization
│   └── CaseSerializer
│
├── views.py            # API endpoints + AI integration
│   └── CaseViewSet
│       ├── list()           # GET /api/cases/
│       ├── create()         # POST /api/cases/
│       ├── retrieve()       # GET /api/cases/{id}/
│       ├── update()         # PUT /api/cases/{id}/
│       ├── destroy()        # DELETE /api/cases/{id}/
│       ├── analyze()        # POST /api/cases/{id}/analyze/
│       ├── upload_document()# POST /api/cases/{id}/upload_document/
│       ├── add_comment()    # POST /api/cases/{id}/add_comment/
│       └── close()          # POST /api/cases/{id}/close/
│
└── urls.py             # URL routing
```

**Cases Module AI Integration:**
```
Case Analysis Flow:
┌──────────────┐
│ User Request │
│  (analyze)   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  CaseViewSet.analyze()   │
│  - Collect case data     │
│  - Format for AI         │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Google Gemini AI API    │
│  - Process case details  │
│  - Generate analysis     │
│  - Extract insights      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Parse AI Response       │
│  - JSON extraction       │
│  - Fallback handling     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Update Case Model       │
│  - Save analysis         │
│  - Update status         │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Return Response         │
│  (Analysis + Case Data)  │
└──────────────────────────┘
```

### 2.5 Chat Module (`chat/`)

```
chat/
├── __init__.py
├── apps.py              # App configuration
├── models.py           # Chat models
│   ├── ChatSession
│   │   ├── session_id (auto)
│   │   ├── user (FK → User)
│   │   ├── case (FK → Case, optional)
│   │   ├── title
│   │   ├── created_at
│   │   └── updated_at
│   │
│   ├── Message
│   │   ├── session (FK → ChatSession)
│   │   ├── role (user/assistant)
│   │   ├── content
│   │   └── timestamp
│   │
│   └── IntegrationSetting
│       ├── user (FK → User)
│       ├── integration_type
│       └── config_data
│
├── serializers.py      # Data serialization
│   ├── ChatSessionSerializer
│   ├── MessageSerializer
│   └── IntegrationSettingSerializer
│
├── views.py           # API endpoints
│   ├── ChatSessionViewSet
│   │   ├── list()
│   │   ├── create()
│   │   ├── retrieve()
│   │   └── messages()
│   │
│   ├── MessageViewSet
│   │   ├── list()
│   │   └── create() (AI interaction)
│   │
│   └── IntegrationSettingViewSet
│
└── urls.py            # URL routing
```

**Chat Module AI Flow:**
```
Chat Interaction Flow:
┌─────────────────┐
│ User Message    │
│ POST /messages/ │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ MessageViewSet.create() │
│ - Save user message     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Get Session Context     │
│ - Previous messages     │
│ - Associated case       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Google Gemini AI API    │
│ - Send conversation     │
│ - Get AI response       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Save AI Message         │
│ - Store response        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Return Both Messages    │
│ (User + AI Response)    │
└─────────────────────────┘
```

---

## 3. Cross-Module Dependencies

### 3.1 Backend Module Interaction

```
┌──────────────────────────────────────────────────┐
│                  Django Core                      │
│              (Settings & URLs)                    │
└───────┬──────────────┬──────────────┬────────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌────────────┐
│    Users     │ │   Cases  │ │    Chat    │
│   Module     │ │  Module  │ │   Module   │
└──────┬───────┘ └────┬─────┘ └─────┬──────┘
       │              │              │
       │       ┌──────┴──────┐       │
       │       │             │       │
       ▼       ▼             ▼       ▼
    ┌─────────────────────────────────┐
    │     Database (SQLite/MySQL)      │
    └─────────────────────────────────┘
           │
           ▼
    ┌─────────────────┐
    │  External APIs  │
    │  - Gemini AI    │
    └─────────────────┘
```

### 3.2 Frontend-Backend Integration

```
Frontend Components          API Endpoints              Backend Modules
─────────────────────       ──────────────             ───────────────

AuthContext.jsx     ──────► /api/users/register/ ────► users.views.RegisterView
                    ──────► /api/users/login/    ────► users.views.LoginView
                    ──────► /api/users/profile/  ────► users.views.ProfileView

CaseCreate.jsx      ──────► /api/cases/         ────► cases.views.CaseViewSet.create()

CaseAnalysis.jsx    ──────► /api/cases/{id}/analyze/ ► cases.views.analyze()
                                                         └──► Gemini AI API

CaseDetails.jsx     ──────► /api/cases/{id}/    ────► cases.views.CaseViewSet.retrieve()
                    ──────► /api/cases/{id}/upload/ ─► cases.views.upload_document()
                    ──────► /api/cases/{id}/comment/ ► cases.views.add_comment()

ChatAssistant.jsx   ──────► /api/chat/sessions/ ────► chat.views.ChatSessionViewSet
                    ──────► /api/chat/messages/ ────► chat.views.MessageViewSet
                                                         └──► Gemini AI API

Dashboard.jsx       ──────► /api/cases/         ────► cases.views.CaseViewSet.list()

AdminDashboard.jsx  ──────► /api/cases/?all=true ───► cases.views (admin filter)
AdminPage.jsx       ──────► /api/users/         ────► users.views (admin actions)
```

---

## 4. Data Flow Architecture

### 4.1 Authentication Flow

```
┌──────────────┐
│   Register   │
│  Component   │
└──────┬───────┘
       │ POST /api/users/register/
       │ {email, password, name}
       ▼
┌─────────────────────┐
│ RegisterSerializer  │
│  - Validate data    │
│  - Hash password    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   User Model        │
│  - Create user      │
│  - Save to DB       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   JWT Token Gen     │
│  - Access token     │
│  - Refresh token    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   AuthContext       │
│  - Store tokens     │
│  - Update state     │
└─────────────────────┘
```

### 4.2 Case Analysis Flow

```
┌──────────────────┐
│  CaseAnalysis    │
│   Component      │
└────────┬─────────┘
         │ POST /api/cases/{id}/analyze/
         │
         ▼
┌────────────────────────┐
│  CaseViewSet.analyze() │
└────────┬───────────────┘
         │
         ├─► Get Case from DB
         │
         ├─► Format Prompt
         │   └─► Include:
         │       - Case description
         │       - Evidence
         │       - Parties involved
         │       - Documents
         │
         ├─► Call Gemini AI
         │   └─► google.generativeai
         │       .GenerativeModel
         │       .generate_content()
         │
         ├─► Parse Response
         │   └─► Try JSON
         │       └─► Fallback to raw text
         │
         ├─► Update Case Model
         │   └─► Save analysis fields:
         │       - summary
         │       - confidence
         │       - recommendations
         │       - evidence_analysis
         │
         └─► Return Response
             └─► CaseSerializer(case).data
```

### 4.3 Chat Interaction Flow

```
┌──────────────────┐
│ ChatAssistant    │
│   Component      │
└────────┬─────────┘
         │ 1. Create Session
         │ POST /api/chat/sessions/
         ▼
┌────────────────────┐
│  ChatSession       │
│  (Created in DB)   │
└────────┬───────────┘
         │
         │ 2. Send Message
         │ POST /api/chat/sessions/{id}/messages/
         │ {content: "user question"}
         ▼
┌────────────────────────┐
│ MessageViewSet.create()│
└────────┬───────────────┘
         │
         ├─► Save User Message
         │
         ├─► Get Conversation History
         │   └─► Previous messages in session
         │
         ├─► Build Context
         │   └─► Include case data if linked
         │
         ├─► Call Gemini AI
         │   └─► Send full conversation
         │
         ├─► Save AI Response
         │
         └─► Return Both Messages
             └─► {user_msg, ai_msg}
```

---

## 5. External Integrations

### 5.1 Google Gemini AI Integration

```
Backend (cases/views.py, chat/views.py)
    │
    ├─► Lazy Import Pattern
    │   └─► import google.generativeai as genai
    │       (Inside function to avoid protobuf errors)
    │
    ├─► Configuration
    │   └─► genai.configure(api_key=settings.GEMINI_API_KEY)
    │
    ├─► Model Initialization
    │   └─► model = genai.GenerativeModel('gemini-pro')
    │
    └─► Content Generation
        └─► response = model.generate_content(prompt)
            │
            ├─► For Case Analysis:
            │   - Structured legal analysis
            │   - Evidence evaluation
            │   - Recommendations
            │
            └─► For Chat:
                - Conversational responses
                - Context-aware answers
                - Legal guidance
```

### 5.2 Database Integration

```
┌─────────────────────────────────┐
│    Database Configuration        │
│    (core/settings.py)            │
└──────────┬──────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐  ┌──────────┐
│ SQLite  │  │  MySQL   │
│  (Dev)  │  │  (Prod)  │
└────┬────┘  └────┬─────┘
     │            │
     └──────┬─────┘
            │
            ▼
    ┌──────────────┐
    │   Django ORM │
    └──────┬───────┘
           │
    ┌──────┴──────────────────┐
    │                         │
    ▼                         ▼
┌─────────┐            ┌─────────────┐
│  Models │            │  Migrations │
│  - User │            │  - Schema   │
│  - Case │            │  - Changes  │
│  - Chat │            │  - History  │
└─────────┘            └─────────────┘
```

---

## 6. Security & Authentication

### 6.1 JWT Authentication Flow

```
┌───────────────────────────────────────────────────────┐
│              JWT Authentication System                 │
└───────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│  Token Creation  │              │ Token Validation │
└────────┬─────────┘              └────────┬─────────┘
         │                                  │
         ├─► User Login                     ├─► API Request
         │   └─► Verify credentials         │   └─► Extract token
         │                                  │       from header
         ├─► Generate Tokens               │
         │   ├─► Access (15 min)           ├─► Decode & Verify
         │   └─► Refresh (7 days)          │   └─► Check signature
         │                                  │       └─► Check expiry
         └─► Return to Client              │
                                           └─► Get User from token
                                               └─► Attach to request
```

### 6.2 Permission System

```
┌────────────────────────────────────┐
│     Permission Architecture        │
└────────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌─────────┐      ┌─────────────┐
│  Roles  │      │ Permissions │
└────┬────┘      └──────┬──────┘
     │                  │
     ├─► Admin          ├─► IsAuthenticated
     │   └─► Full       │
     │       Access     ├─► IsOwnerOrAdmin
     │                  │   └─► Check case.owner
     └─► User           │       or user.is_staff
         └─► Own        │
             Cases      └─► IsAdminUser
                            └─► user.role == 'admin'
```

---

## 7. File Upload & Storage

```
┌──────────────────────────────────────┐
│      Media File Management           │
└──────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  MEDIA_ROOT = backend/media/          │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  Upload Flow:                         │
│  1. POST /api/cases/{id}/upload/      │
│  2. FileField validation              │
│  3. Save to: media/case_documents/    │
│              YYYY/MM/filename         │
│  4. Update Case.documents JSON        │
└───────────────────────────────────────┘
```

---

## 8. Development vs Production

### 8.1 Environment Configuration

```
┌──────────────────────────────────────────┐
│        Environment Variables              │
└──────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────┐
│   Dev   │ │   Prod   │
└────┬────┘ └────┬─────┘
     │           │
     ├─► DEBUG = True          ├─► DEBUG = False
     ├─► SQLite               ├─► MySQL/PostgreSQL
     ├─► localhost:8000       ├─► Domain name
     ├─► CORS: *              ├─► CORS: specific origins
     └─► No HTTPS required    └─► HTTPS required
```

---

## 9. Module Communication Summary

```
┌────────────────────────────────────────────────────────────┐
│                    REQUEST FLOW                             │
└────────────────────────────────────────────────────────────┘

Frontend (React)
    │
    │ HTTP Request (Axios/Fetch)
    │ Headers: Authorization: Bearer <JWT>
    ▼
API Gateway (Django URLs)
    │
    │ Route Matching
    ▼
Middleware Stack
    │
    ├─► CORS Validation
    ├─► JWT Authentication
    ├─► Permission Check
    └─► Session Management
    │
    ▼
ViewSet/View
    │
    ├─► Deserialize Request
    │   (Serializer)
    │
    ├─► Business Logic
    │   ├─► Database Query
    │   ├─► AI Processing (if needed)
    │   └─► File Operations
    │
    └─► Serialize Response
        (Serializer)
    │
    ▼
HTTP Response (JSON)
    │
    │ Status Code + Data
    ▼
Frontend (React)
    │
    └─► Update UI State
        └─► Re-render Components
```

---

## 10. Technology Stack Summary

### Backend Stack
```
Django Framework
├── Django REST Framework (API)
├── SimpleJWT (Authentication)
├── CORS Headers (Cross-origin)
├── WhiteNoise (Static files)
└── PyMySQL (Database driver)

External Services
├── Google Gemini AI (Analysis & Chat)
└── Database (SQLite/MySQL)
```

### Frontend Stack
```
React 18
├── React Router (Navigation)
├── Vite (Build tool)
├── Tailwind CSS (Styling)
├── Framer Motion (Animations)
├── Lucide React (Icons)
├── jsPDF (PDF generation)
└── html2canvas (Screenshots)
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Production Deployment                │
└──────────────────────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
    ┌──────────────┐          ┌──────────────────┐
    │   Frontend   │          │     Backend      │
    │   (Vercel)   │          │    (Render)      │
    └──────┬───────┘          └────────┬─────────┘
           │                           │
           │ VITE_API_URL             │
           │ Environment Var          │
           │                          │
           └──────────►───────────────┘
                   API Calls
                   (HTTPS + JWT)
                          │
                          ▼
              ┌──────────────────────┐
              │   External Services   │
              ├──────────────────────┤
              │ - Gemini AI API      │
              │ - PostgreSQL DB      │
              │ - Media Storage      │
              └──────────────────────┘
```

---

**End of Module Hierarchy Diagram**

*Last Updated: November 26, 2025*
*Project: Case Analysis System*
*Author: NIKHIL JADHAV*
