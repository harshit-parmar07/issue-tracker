# Issue Tracker - Project Management Dashboard

![Live Demo](https://img.shields.io/badge/Live_Demo-Available-success?style=for-the-badge&logo=vercel)
<!--
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
-->
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Live Application:** [issue-tracker-six-black.vercel.app](https://issue-tracker-six-black.vercel.app/)

## 🚀 Overview

Issue Tracker is a full-stack, comprehensive bug and task management application designed to streamline project workflows. Built from the ground up using the latest Next.js App Router, it provides a clean, interactive dashboard for creating, assigning, and monitoring software issues. The application features a robust relational database schema, secure user authentication, and enterprise-grade error monitoring.

## ✨ Key Features

* **Complete Issue Lifecycle:** Create, read, update, and delete (CRUD) issues. Track issue status (Open, In Progress, Closed).
* **User Assignment:** Seamlessly assign tasks to specific users within the system.
* **Interactive Dashboard:** Visualize current project metrics and issue statuses at a glance with graphical data representations.
* **Markdown Support:** Rich text editing and rendering for comprehensive issue descriptions.
* **Data Validation:** Strict end-to-end type safety and schema validation using Zod to ensure data integrity.
* **Error Tracking:** Integrated with Sentry for real-time, production-grade bug and performance monitoring.
* **Responsive UI:** A beautifully crafted, accessible interface built with Tailwind CSS and Radix UI components.

## 🛠 Tech Stack

* **Framework:** Next.js (App Router, Server Actions, Server/Client Components)
* **Language:** TypeScript
* **Database:** MySQL
* **ORM:** Prisma
* **Styling & UI:** Tailwind CSS, Radix UI Primitives
* **Authentication:** NextAuth.js
* **Monitoring:** Sentry

## ⚙️ Local Setup & Installation

To run this project locally, you will need **Node.js** and a **MySQL** database instance.

### 1. Clone the repository
```bash
git clone [https://github.com/harshit-parmar07/issue-tracker.git](https://github.com/harshit-parmar07/issue-tracker.git)
cd issue-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add the following keys. You will need to provide your own MySQL connection string and authentication secrets.

```env
# Database connection string (MySQL)
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secure_random_string_here"

# OAuth Providers 
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Sentry Configuration (For error tracking)
NEXT_PUBLIC_SENTRY_DSN="your_sentry_dsn_here"
```

### 4. Database Setup
Push the Prisma schema to your MySQL database to create the required tables:
```bash
npx prisma db push
```

### 5. Start the Development Server
```bash
npm run dev
```

Your server should now be running locally on `http://localhost:3000`.

## 🤝 Architecture Note
This application utilizes **Next.js App Router**, taking heavy advantage of Server Components to minimize client-side JavaScript, resulting in fast page loads. The data access layer is handled securely on the server via Prisma ORM, providing a strictly typed database client that syncs perfectly with TypeScript interfaces.
