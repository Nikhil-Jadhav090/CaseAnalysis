## AI agent orientation — Case Analysis repo (short)

This repo is a two-tier web app: a Django REST backend (`backend/`) and a React + Vite + Tailwind frontend (`frontend/`). Keep edits small, testable, and conservative.

Key concepts (quick):
- Backend: Django 5 + DRF. JWT auth via `rest_framework_simplejwt`. Custom user model: `users.User`.
- Frontend: React (v18) + Vite on port 5173. API calls live under `frontend/src/` (see `AuthContext.jsx` and pages).
- AI: Google Gemini used from server-side endpoints in `backend/cases/views.py` and `backend/chat/views.py`. Gemini is imported lazily to avoid protobuf/import-time errors.

Where to read first:
- `backend/core/settings.py` — env-driven config (DB selection, `GEMINI_API_KEY`, `MEDIA_ROOT`).
- `backend/cases/views.py` — `CaseViewSet` (create, `analyze`, `upload_document`, `add_comment`, `close`). Case IDs are generated as `CASE-<8 hex chars>` in `perform_create()`.
- `backend/chat/views.py` — chat session/message flow and Gemini usage pattern.
- `frontend/src/` — `App.jsx`, `context/AuthContext.jsx`, and pages under `frontend/src/pages/` to see how UI calls the API.

Developer workflows (PowerShell examples):
- Backend:
  - python -m venv venv; .\venv\Scripts\Activate.ps1
  - pip install -r backend/requirements.txt
  - create a `.env` in `backend/` with `GEMINI_API_KEY` and DB vars
  - python manage.py migrate; python manage.py createsuperuser; python manage.py runserver
- Frontend:
  - cd frontend; npm install
  - npm run dev

Project-specific patterns and gotchas:
- Lazy AI imports: always use lazy imports for `google.generativeai` server-side to prevent import-time protobuf failures during migrations.
- Permissive AI parsing: `analyze()` tries `json.loads(response.text)` and falls back to returning raw text — preserve this fallback when changing parsing.
- DB fallback: if `DB_NAME` env var is unset the project falls back to SQLite. Keep migrations compatible with both MySQL and SQLite.
- File uploads use `MEDIA_ROOT` (see `backend/core/settings.py`); ensure local `MEDIA_ROOT` is writable for upload tests.
- Permissions: non-staff users are limited by `IsOwnerOrAdmin` in `cases.views` — follow this pattern unless explicitly changing access.
- Windows: prefer `PyMySQL` in the environment (included in `requirements.txt`) instead of compiled mysql clients.

Integration snippets (where to look for examples):
- AI analyze: `POST /api/cases/{id}/analyze/` calls Gemini in `backend/cases/views.py`.
- Chat: `POST /api/chat/sessions/{id}/messages/` (see `backend/chat/views.py`) saves user + AI messages.

Small, safe changes to prioritize (low-risk):
- Improve error responses and schema for AI endpoints (keep permissive fallback). See `cases/views.py` and `chat/views.py` for examples.
- Add unit tests for `CaseViewSet.analyze` covering JSON and non-JSON responses; mock Gemini client.
- Add a CI smoke test that runs Django migrations against SQLite, starts the backend, and hits a couple of API endpoints (auth + cases) while mocking Gemini.

If anything here is unclear or you'd like a longer agent guide (examples, common PRs, or test harnesses), tell me which section to expand and I will iterate.
