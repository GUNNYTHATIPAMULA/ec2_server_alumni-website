# College Alumni Platform

A full-stack web application that connects college alumni, current students, and administrators — enabling networking, mentorship, event management, job postings, and knowledge sharing within the college community.

---

## Tech Stack

### Backend
- **Language:** Python 3
- **Framework:** FastAPI (async)
- **ORM:** SQLAlchemy 2.0 (async with `AsyncSession`)
- **Database:** PostgreSQL (via `asyncpg` driver)
- **Authentication:** JWT (python-jose) with Bearer tokens + cookie-based session data
- **Password Hashing:** bcrypt
- **Email:** SMTP via `aiosmtplib` (Gmail integration)
- **File Uploads:** FastAPI `StaticFiles` with UUID-based naming
- **Validation:** Pydantic / Pydantic Settings

### Frontend
- **Framework:** React 19 (JSX)
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4
- **Routing:** React Router DOM 7
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Notifications:** React Toastify
- **Deployment:** Vercel + Docker

### DevOps
- **Containerization:** Docker + Docker Compose
- **CI/CD:** Vercel (frontend), Docker-based deployment (backend)

---

## Architecture

The project follows a **layered architecture**:

```
Routes (API endpoints)
  -> Services (business logic)
    -> Models (SQLAlchemy ORM)
      -> Database (PostgreSQL)
```

Additional layers include **schemas** (Pydantic request/response models), **utils** (OTP generation, email sending, password hashing), **repositories** (data access abstraction, planned), **middleware** (auth, logging, rate limiting, planned), and **WebSockets** (chat, real-time notifications, planned).

---

## User Roles

| Role | Description |
|------|-------------|
| **Admin** | Manages the platform — verifies alumni, blocks users, oversees events/posts/jobs/mentorship, views dashboard analytics |
| **Alumni** | Verified graduates — manages professional profile, connects with peers, posts jobs, mentors students, makes contributions |
| **Student** | Current students — builds profile, browses alumni directory, applies for jobs, requests mentorship |

---

## Features

### Authentication & Authorization
- Email OTP verification (6-digit code, 5-minute expiry)
- Phone OTP verification (for alumni registration)
- JWT-based login with 7-day token expiry
- Role-based access control (Admin, Alumni, Student)
- Cookie-based session data (token, role, userId, fullName)
- Automatic cleanup of orphaned unverified accounts on startup

### Admin Features
- **Dashboard** — aggregate stats (total alumni, students, admins, events, posts, jobs, mentorship requests, pending approvals)
- **User Verification** — review and approve pending alumni/student registrations
- **User Management** — block/unblock users, view detailed alumni profiles
- **Content Moderation** — delete posts, manage job postings, oversee mentorship requests
- **Admin Profile** — manage designation, department, office email, profile image

### Alumni Features
- **Profile Management** — full_name, roll_number, branch, degree, batch years, occupation, company, location, bio, social links, profile image, mentorship availability flag
- **Education Records** — add, list, and delete multiple education entries (degree, institution, field of study, years)
- **Work Experience** — add, list, and delete experience records (company, role, years, description)
- **Skills** — add, list, and delete skill tags
- **Social Links** — add custom platform links (LinkedIn, GitHub, etc.)
- **Alumni Directory** — browse all alumni profiles with experience indicators
- **Profile Viewing** — view any alumni's full profile and experience by user ID

### Student Features
- **Profile Management** — full_name, roll_number, branch, degree, batch years, current semester, skills, interests, social links, resume, bio, profile image
- **Student Directory** — browse all student profiles
- **Event Browsing** — view and register for events

### Connection & Networking
- Send connection requests between users
- Accept or reject incoming requests
- View pending requests and established connections
- Duplicate/conflict prevention (checks both directions)

### Mentorship
- Students/alumni can request mentorship from available alumni
- Mentors can accept or reject requests
- View all mentorship requests (as mentor or mentee)
- Duplicate pending request prevention

### Events
- Create events with title, description, date, location, venue, max participants, registration deadline
- Register for events (duplicate registration prevention)
- View event registrations with attendee details
- Delete events (creator or admin only)
- **Event Images** — add, list, and delete multiple images per event with captions

### Job Board
- Post jobs with title, company, location, description, requirements, employment type, experience level, salary range, deadline, contact email
- Browse all active job listings
- View your own posted jobs
- Delete jobs (owner only)
- Admin can also manage jobs

### Posts & Content
- Create posts with title, content, tags, and optional image
- Browse all published posts
- Delete posts (author only)
- Admin can delete any post

### Contributions
- Alumni can make financial contributions with amount and purpose
- Track contribution history (all contributions or personal)
- Status tracking (completed by default)

### Notifications
- In-app notification system (title, message, type, link)
- Mark notifications as read
- Owner-only read marking

### File Uploads
- Profile image upload with validation (jpg, jpeg, png, gif, webp)
- Max file size: 5MB
- UUID-based file naming to prevent conflicts
- Served as static files via `/uploads/`

### Public Routes
- Alumni directory
- Student directory
- Event listings
- Event images
- Job listings
- Post listings
- Individual alumni profiles and experience

---

## API Endpoints (70 total)

| Module | Prefix | Endpoints |
|--------|--------|-----------|
| Auth | `/auth` | 9 |
| Admin | `/admin` | 15 |
| Alumni | `/alumni` | 11 (profile + education + experience + skills) |
| Student | `/student` | 3 |
| Events | `/events` | 9 (events + images) |
| Posts | `/posts` | 3 |
| Connections | `/connections` | 4 |
| Contributions | `/contributions` | 3 |
| Jobs | `/jobs` | 4 |
| Mentorship | `/mentorship` | 3 |
| Notifications | `/notifications` | 2 |
| Upload | `/upload` | 1 |

---

## Data Models (18 models)

| Model | Table | Description |
|-------|-------|-------------|
| User | `users` | Core user account with credentials, role, OTP verification state |
| AdminProfile | `admin_profiles` | Admin details (name, designation, department) |
| AlumniProfile | `alumni_profiles` | Alumni details (academic, professional, social) |
| StudentProfile | `student_profiles` | Student details (academic, skills, resume) |
| AlumniEducation | `alumni_education` | Alumni education history |
| AlumniExperience | `alumni_experiences` | Alumni work experience |
| AlumniSkill | `alumni_skills` | Alumni skill tags |
| AlumniLink | `alumni_links` | Alumni custom social links |
| Connection | `connections` | User-to-user connection requests |
| Contribution | `contributions` | Alumni financial contributions |
| Event | `events` | College events |
| EventRegistration | `event_registrations` | Event attendee registrations |
| EventImage | `event_images` | Images attached to events |
| Job | `jobs` | Job postings |
| MentorshipRequest | `mentorship_requests` | Mentorship requests between users |
| Notification | `notifications` | In-app notifications |
| Post | `posts` | Community posts/articles |

---

## Project Structure

```
collegealumni_website/
├── alumni_backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/          # 17 route modules
│   │   │   └── router.py        # Central router
│   │   ├── core/
│   │   │   ├── config.py        # Settings (env-based)
│   │   │   ├── database.py      # Async SQLAlchemy engine
│   │   │   ├── roles.py         # UserRole enum
│   │   │   ├── security.py      # JWT creation/verification
│   │   │   └── dependencies.py  # DB session dependency
│   │   ├── middleware/          # Auth, logging, rate limiting (planned)
│   │   ├── models/             # 18 SQLAlchemy models
│   │   ├── repositories/       # Data access layer (planned)
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/           # Business logic layer
│   │   ├── tests/              # Test suite
│   │   ├── utils/              # OTP, email, password utilities
│   │   └── websocket/          # Chat & notification sockets (planned)
│   ├── uploads/                # Uploaded files
│   ├── .env                    # Environment variables
│   └── main.py                 # FastAPI app entry point
├── frontend/
│   └── alumniserver/
│       ├── src/
│       │   ├── components/     # Shared UI components
│       │   ├── context/        # Auth context
│       │   ├── layout/         # Role-based layouts
│       │   ├── pages/          # Page components
│       │   │   ├── admin/      # Admin pages (8)
│       │   │   ├── alumni/     # Alumni pages (11)
│       │   │   └── student/    # Student pages (3)
│       │   └── services/       # API service layer
│       ├── Dockerfile
│       ├── docker-compose.yml
│       └── vercel.json
└── uploads/                    # Shared uploads directory
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- SMTP email credentials (Gmail app password)

### Backend Setup
```bash
cd collegealumni_website/alumni_backend
pip install -r requirements.txt
# Configure .env with DATABASE_URL, SMTP credentials, SECRET_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd collegealumni_website/frontend/alumniserver
npm install
npm run dev
```

### Docker Setup
```bash
cd collegealumni_website
docker-compose up --build
```

---

## Planned Features
- **WebSocket Chat** — real-time direct messaging between connected users
- **Real-time Notifications** — push notifications via WebSocket
- **Rate Limiting Middleware** — API abuse prevention
- **Logging Middleware** — request/response logging
- **Repository Pattern** — data access abstraction layer
- **Pagination** — paginated API responses
- **Input Validators** — reusable validation utilities
- **Analytics Dashboard** — detailed platform usage analytics
