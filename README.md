# PropVault CRM — Premium Property Dealer CRM

> A production-level CRM system built for Pakistan's elite real estate market.  
> Designed for DHA / Bahria-level property dealers with a luxury dark theme.

---

## Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Frontend     | Next.js 16 (App Router), React 19, TypeScript  |
| Styling      | Tailwind CSS v4, Glassmorphism design system   |
| Charts       | Recharts                                        |
| Database     | MongoDB Atlas + Mongoose 9                      |
| Auth         | JWT (jsonwebtoken) + bcryptjs, httpOnly cookies |
| Real-time    | Socket.io (custom Node server)                  |
| Email        | Nodemailer (Gmail SMTP)                         |
| Validation   | Zod v4                                          |
| Deployment   | Vercel (Next.js) + separate Socket.io server    |

---

## Features

### Authentication (15 marks)
- Signup & Login with bcrypt password hashing
- JWT stored in httpOnly cookie (7-day expiry)
- Edge middleware for route protection
- Admin/Agent role-based access control

### Lead Management (15 marks)
- Create, view, update, delete leads
- Admin sees all leads; agents see only assigned leads
- Property listing card UI (not plain table rows)
- Budget displayed as PKR Crore / Lakh
- Grid and list view toggle
- Search + status + priority filters

### Lead Scoring (10 marks)
- Auto-computed from budget via Mongoose pre-save hook
- Budget ≥ 20M → High priority, score 90
- Budget 10M–20M → Medium priority, score 60–75
- Budget < 10M → Low priority, score 20–40
- Visual score bar on every lead card

### Real-Time (10 marks)
- Socket.io custom server (port 3001)
- Toast notifications for: new lead, lead assigned, status change
- No page refresh needed
- Falls back silently when socket server is not running

### WhatsApp + Email (10 marks)
- Click-to-chat WhatsApp links (Pakistani number formatting)
- Email on new lead creation (to admin)
- Email on lead assignment (to agent)
- Styled HTML email templates

### Activity Timeline (10 marks)
- Every lead mutation is logged to ActivityLog collection
- Chronological timeline UI on lead detail page
- Tracks: created, updated, assigned, status changed, note added, follow-up set

### Smart Follow-ups (10 marks)
- Agents schedule follow-up reminders per lead
- Overdue detection (scheduledAt < now, isDone = false)
- Dashboard highlights overdue count
- Mark done with one click

### Analytics Dashboard (10 marks)
- Total leads, active leads, closed deals, overdue count
- Monthly lead trend (bar chart)
- Priority distribution (pie chart)
- Status distribution (horizontal bar chart)
- Agent performance table with close rate and progress bar

### Bonus Features (+10)
- AI follow-up suggestion engine (rule-based, per lead context)
- CSV export (all leads for admin, own leads for agent)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/MFaheemS/Property_Dealer_CRM.git
cd Property_Dealer_CRM/propvault
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/propvault
JWT_SECRET=your_secret_here
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Seed the database

Start the dev server, then:

```bash
curl -X POST http://localhost:3000/api/seed
```

Or visit `http://localhost:3000/api/seed` via Postman (POST).

Demo credentials:
- **Admin:** admin@propvault.pk / admin123
- **Agent:** zara@propvault.pk / agent123

### 4. Run

```bash
# Terminal 1 — Next.js app
npm run dev

# Terminal 2 — Socket.io server (optional, for real-time)
npm run dev:socket
```

---

## Folder Structure

```
src/
├── app/
│   ├── (auth)/          login, signup pages
│   ├── (dashboard)/     all protected pages
│   └── api/             all API routes
├── components/
│   ├── dashboard/       StatsCard, charts
│   ├── layout/          Sidebar, Navbar
│   ├── leads/           LeadCard, LeadForm, Timeline, FollowUp, AISuggest
│   └── shared/          Toast, PriorityBadge, StatusPill
├── context/             AuthContext
├── hooks/               useAuth, useLeads, useSocket, useAnalytics
├── lib/                 db, auth, utils, apiClient, rateLimit, socketEmitter
├── models/              User, Lead, ActivityLog, FollowUp
├── services/            authService, leadService, analyticsService, emailService
└── types/               TypeScript interfaces
```

---

## Database Schema

```
User        { name, email, password(bcrypt), role, avatar }
Lead        { name, email, phone, propertyInterest, budget,
              status, priority(auto), score(auto), notes,
              assignedTo→User, followUpDate }
ActivityLog { leadId→Lead, action, performedBy→User, meta, timestamp }
FollowUp    { leadId→Lead, agentId→User, scheduledAt, note, isDone }
```

---

## API Reference

| Method | Endpoint              | Auth   | Description              |
|--------|-----------------------|--------|--------------------------|
| POST   | /api/auth/signup      | Public | Create account           |
| POST   | /api/auth/login       | Public | Login, sets JWT cookie   |
| POST   | /api/auth/logout      | Any    | Clear cookie             |
| GET    | /api/auth/me          | Any    | Current user profile     |
| GET    | /api/leads            | Any    | List leads (RBAC filter) |
| POST   | /api/leads            | Any    | Create lead              |
| GET    | /api/leads/:id        | Any    | Lead detail              |
| PUT    | /api/leads/:id        | Any    | Update lead              |
| DELETE | /api/leads/:id        | Admin  | Delete lead              |
| GET    | /api/agents           | Admin  | List all agents          |
| GET    | /api/analytics        | Admin  | Analytics summary        |
| GET    | /api/activity/:leadId | Any    | Lead activity timeline   |
| GET    | /api/followup         | Any    | Agent's follow-ups       |
| POST   | /api/followup         | Any    | Schedule follow-up       |
| PATCH  | /api/followup         | Any    | Mark follow-up done      |
| GET    | /api/export           | Any    | Download CSV             |
| POST   | /api/ai-suggest       | Any    | AI follow-up suggestion  |
| POST   | /api/seed             | Dev    | Reset & seed database    |

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy — Next.js auto-detected
5. Run Socket.io server separately (Railway / Render)

---

Built with Next.js 16 App Router · MongoDB · Socket.io · Tailwind CSS v4
