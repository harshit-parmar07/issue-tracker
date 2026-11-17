# Issue Tracker

A full-stack bug and task tracking web application built with Next.js App Router, TypeScript, Prisma, and MySQL. It supports the full issue lifecycle, triage workflows, relational tagging, full-text search, and an audit-logged activity timeline.

**Live Demo:** [issue-tracker.harshitparmar.tech](https://issue-tracker.harshitparmar.tech/)

---

## Tech Stack

- **Framework:** Next.js 13.5 (App Router, React Server Components, Route Handlers, Middleware)
- **Language:** TypeScript
- **Database & ORM:** MySQL, Prisma (`fullTextSearch`, `fullTextIndex`)
- **Authentication:** NextAuth.js (Google OAuth, JWT session strategy, Prisma Adapter)
- **Client State & Forms:** TanStack React Query, Axios, React Hook Form, Zod
- **UI & Visualization:** Radix UI Themes, Tailwind CSS, Recharts, SimpleMDE, React Markdown

---

## Features

### Issue Management & Triage

- **CRUD Operations:** Create, view, edit, and delete issues with Markdown descriptions (`SimpleMDE` editor and `react-markdown` rendering).
- **Status & Priority Workflows:** Track issues across `Open`, `In Progress`, and `Closed` statuses and assign `Low`, `Medium`, `High`, or `Critical` priority levels.
- **User Assignment:** Assign or unassign issues to registered users with React Query caching.
- **Many-to-Many Labels:** Tag issues with color-coded labels (`bug`, `feature`, `security`, `performance`, etc.) backed by an explicit `IssueLabel` join table.
- **SLA Due Date Tracking:** Set optional due dates on issues; open tickets are automatically flagged when due soon (within 48 hours) or overdue.

### Activity Timeline & Comments

- **Comment Thread:** Authenticated users can post Markdown comments on any issue.
- **Audit Trail:** Changes to status, priority, assignee, labels, and due dates are automatically recorded in `IssueActivity` alongside comment creation using `prisma.$transaction()` so state updates and audit logs stay in sync.

### Search, Filtering & Dashboard

- **Full-Text Search & Multi-Faceted Filtering:** Debounced keyword search backed by a MySQL `FULLTEXT` index on `(title, description)`, combined with URL-synced filters for status, priority, assignee, label, and overdue SLA status.
- **Bi-Directional Sorting & Pagination:** Sort issues ascending or descending by title, status, priority, SLA due date, or creation date with server-side pagination.
- **Project Dashboard:** Displays issue counts by status, overdue issue count, a status distribution bar chart (Recharts), and the 5 most recently created issues.

### Authentication & Validation

- **Protected Routes & APIs:** NextAuth middleware protects issue creation and edit pages, while write API endpoints (`POST`, `PATCH`, `DELETE`) verify server sessions and validate request payloads with Zod schemas.

---

## Data Model & Architecture Notes

- **Relational Schema (`prisma/schema.prisma`):**
  - `Issue`: Core ticket entity indexed on `(status, priority, createdAt)`, `(dueDate)`, `(assignedToUserId)`, and a composite `@@fulltext([title, description])` index.
  - `Label` & `IssueLabel`: Explicit many-to-many relationship using a composite primary key `@@id([issueId, labelId])` with cascading deletes.
  - `Comment` & `IssueActivity`: Separate tables for user discussions and append-only system audit events, merged chronologically on the server in the issue detail view.
  - `User`, `Account`, `Session`, `VerificationToken`: Standard NextAuth Prisma adapter models.
- **URL-Driven Server Components:** Filter, search, sort, and pagination states live in URL query parameters on `/issues/list`, allowing the Server Component to compose a single Prisma `where` query and execute `findMany` and `count` in parallel via `Promise.all()`.

---

## Local Setup

### Prerequisites

- Node.js `20.x` or `22.x`
- A running MySQL instance
- Google OAuth credentials (from Google Cloud Console)

### 1. Clone and install dependencies

```bash
git clone https://github.com/harshit-parmar07/issue-tracker.git
cd issue-tracker
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# MySQL connection string
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_random_secret_string"

# Google OAuth provider
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

```

### 3. Push the database schema

Create the tables and indexes in your MySQL database and generate the Prisma client:

```bash
npx prisma db push
npx prisma generate
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```text
app/
├── api/
│   ├── auth/[...nextauth]/   # NextAuth handler
│   ├── issues/               # Issue creation, updates, deletion, and comments
│   ├── labels/               # Label listing and default label initialization
│   └── users/                # Public user list (id, name, image) for assignment
├── auth/                     # NextAuth options and session provider
├── components/               # Reusable UI components (badges, pagination, skeletons)
├── issues/
│   ├── _components/          # Shared IssueForm and skeleton components
│   ├── [id]/                 # Issue detail view, sidebar controls, and activity timeline
│   ├── edit/[id]/            # Edit issue page
│   ├── list/                 # Search/filter bar, sortable table, and pagination
│   └── new/                  # Create issue page
├── IssueChart.tsx            # Dashboard bar chart
├── IssueSummary.tsx          # Dashboard status & overdue summary cards
├── LatestIssues.tsx          # Dashboard recent issues list
├── NavBar.tsx                # Top navigation and auth menu
├── page.tsx                  # Dashboard route
└── validationSchemas.tsx     # Shared Zod validation schemas
prisma/
├── schema.prisma             # MySQL schema, relations, and indexes
└── client.ts                 # PrismaClient singleton
middleware.ts                 # Route protection for /issues/new and /issues/edit/*
```
