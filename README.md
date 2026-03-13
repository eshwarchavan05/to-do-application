<<<<<<< HEAD
# to-do-application
its to-do application for the aspiring students task
=======
# ⚡ TaskMaster Pro — Full-Stack SaaS Task Management

A production-grade MERN stack task management platform with Kanban boards, real-time collaboration, analytics, and team management.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Recharts, @dnd-kit |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose (with aggregation pipelines) |
| Real-time | Socket.io |
| Auth | JWT + bcryptjs (12 rounds) |
| Styling | CSS custom properties (design system) |
| Fonts | Syne (display) + DM Sans (body) |

---

## 📁 Project Structure

```
taskmaster-pro/
├── backend/
│   ├── config/db.js
│   ├── middleware/
│   │   ├── auth.js          # JWT protect + role guards
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js   # express-rate-limit
│   ├── models/
│   │   ├── User.js          # bcrypt + streak + online status
│   │   ├── Project.js       # members with roles, columns
│   │   ├── Task.js          # subtasks, comments, time tracking, attachments
│   │   ├── Notification.js
│   │   └── Activity.js      # audit trail
│   ├── routes/
│   │   ├── auth.js          # register, login, profile, password
│   │   ├── projects.js      # CRUD + invite + analytics
│   │   ├── tasks.js         # CRUD + reorder + subtasks + comments + time
│   │   ├── notifications.js
│   │   └── analytics.js     # dashboard stats
│   ├── socket/index.js      # Socket.io handlers
│   └── server.js
│
└── frontend/src/
    ├── components/
    │   ├── kanban/KanbanBoard.jsx   # @dnd-kit drag-and-drop
    │   ├── layout/
    │   │   ├── Sidebar.jsx          # collapsible, project list
    │   │   ├── Topbar.jsx           # notifications panel
    │   │   └── Layout.jsx
    │   └── modals/
    │       ├── TaskModal.jsx        # details/subtasks/comments/time tabs
    │       └── ProjectModal.jsx
    ├── context/
    │   ├── AuthContext.jsx          # global auth + socket init
    │   └── ProjectContext.jsx
    ├── hooks/useTasks.js
    ├── pages/
    │   ├── Dashboard.jsx    # stats + charts + upcoming tasks
    │   ├── Board.jsx        # Kanban view
    │   ├── MyTasks.jsx      # list view with filters
    │   ├── CalendarPage.jsx # monthly calendar with task dots
    │   ├── Analytics.jsx    # project-level charts
    │   ├── Team.jsx         # member management + invite
    │   ├── Activity.jsx     # audit timeline
    │   └── Settings.jsx     # profile + password
    ├── utils/
    │   ├── api.js           # axios + interceptors
    │   ├── socket.js        # socket.io client
    │   └── helpers.js       # formatters + config maps
    └── styles/globals.css   # full design system with CSS variables
```

---

## ✨ Features

### Task Management
- ✅ Create tasks with title, description, priority, status, due date, tags
- ✅ Subtasks with completion tracking + auto progress bar
- ✅ Comments with @mention support
- ✅ Time tracking with start/stop timer + total logged time
- ✅ File attachment support (model ready)
- ✅ Task dependencies (model ready)

### Kanban Board
- ✅ 5-column Kanban: Backlog / To Do / In Progress / Review / Done
- ✅ Drag-and-drop cards between columns (@dnd-kit)
- ✅ Quick add task per column
- ✅ Priority badges, assignee avatars, due date warnings on cards
- ✅ Overdue visual indicators

### Analytics & Dashboard
- ✅ Stats cards (total, in progress, completed, overdue, this week)
- ✅ 30-day completion line chart (Recharts)
- ✅ Priority pie/donut chart
- ✅ Upcoming tasks with due dates
- ✅ Project-level analytics (status + priority + team member performance)

### Collaboration
- ✅ Create projects with custom color + icon
- ✅ Invite team members by email
- ✅ Role-based access: Owner / Admin / Member / Viewer
- ✅ Real-time updates via Socket.io (task create/update/delete/reorder)
- ✅ Online status indicators
- ✅ Activity feed / audit log

### Notifications
- ✅ In-app notification center with unread badge
- ✅ Task assignment notifications
- ✅ Project invite notifications
- ✅ Mark all read / individual read

### Calendar
- ✅ Monthly calendar view
- ✅ Tasks shown on due date with color coding
- ✅ Side panel showing selected day's tasks

### Auth & Security
- ✅ JWT with 7-day expiry
- ✅ bcrypt password hashing (12 rounds)
- ✅ Rate limiting (auth: 20/15min, API: 200/min)
- ✅ Helmet security headers
- ✅ Token auto-attach via Axios interceptor
- ✅ 401 auto-redirect

---

## 🚀 Setup

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)

### 1. Clone & install

```bash
git clone <repo-url>
cd taskmaster-pro

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

`backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmaster_pro
JWT_SECRET=your_32_char_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Run

**Terminal 1 (Backend):**
```bash
cd backend && npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm start
```

App: `http://localhost:3000`  
API: `http://localhost:5000/api`

---

## 📡 API Reference

### Auth `/api/auth`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register |
| POST | `/login` | No | Login |
| GET | `/me` | Yes | Current user |
| PUT | `/profile` | Yes | Update profile |
| PUT | `/change-password` | Yes | Change password |
| POST | `/logout` | Yes | Logout |

### Projects `/api/projects`
| Method | Route | Description |
|---|---|---|
| GET | `/` | All user projects |
| POST | `/` | Create project |
| GET | `/:id` | Get project |
| PUT | `/:id` | Update project |
| DELETE | `/:id` | Delete project |
| POST | `/:id/invite` | Invite member |
| DELETE | `/:id/members/:userId` | Remove member |
| GET | `/:id/activity` | Activity log |
| GET | `/:id/analytics` | Project analytics |

### Tasks `/api/tasks`
| Method | Route | Description |
|---|---|---|
| GET | `/project/:projectId` | Project tasks |
| GET | `/:id` | Single task |
| POST | `/` | Create task |
| PUT | `/:id` | Update task |
| DELETE | `/:id` | Delete task |
| PATCH | `/reorder` | Kanban reorder |
| POST | `/:id/subtasks` | Add subtask |
| PATCH | `/:id/subtasks/:subtaskId` | Toggle subtask |
| POST | `/:id/comments` | Add comment |
| POST | `/:id/time/start` | Start timer |
| PATCH | `/:id/time/:entryId/stop` | Stop timer |

### Analytics `/api/analytics`
| Method | Route | Description |
|---|---|---|
| GET | `/dashboard` | User dashboard stats |

---

## 🚢 Deployment

### Backend → Railway / Render
```bash
# Set env vars in dashboard
# Deploy from /backend
```

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy build/ folder
# Set REACT_APP_API_URL=https://your-api.railway.app/api
# Set REACT_APP_SOCKET_URL=https://your-api.railway.app
```

---

## 🎯 What makes this stand out

1. **Kanban drag-and-drop** with @dnd-kit (the modern DnD library)
2. **Real-time Socket.io** — all task changes instantly sync across team
3. **Rich analytics** — completion trends, priority breakdown, team performance
4. **Full data model** — subtasks, comments, time entries, attachments all in one Task document
5. **Activity audit log** — every action creates an activity record
6. **Role-based access** — Owner/Admin/Member/Viewer per project
7. **Notification system** — real-time + persistent with unread counts
8. **Production patterns** — rate limiting, Helmet, error handling, compound indexes

---

## 📄 License
MIT
>>>>>>> df19ed9 (Initial commit)
