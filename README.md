# Issue Tracker - Project Management Dashboard

![Live Demo](https://img.shields.io/badge/Live_Demo-Available-success?style=for-the-badge&logo=vercel)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Live Application:** [issue-tracker-six-black.vercel.app](https://issue-tracker-six-black.vercel.app/)

## 🚀 Overview

Issue Tracker is a full-stack bug and task management application designed to streamline project workflows. Built using the Next.js App Router, it provides an interactive dashboard for creating, assigning, and monitoring software issues. The application features a relational database schema, secure user authentication, and enterprise-grade error monitoring.

## ✨ Key Features

* **Complete Issue Lifecycle:** Create, read, update, and delete (CRUD) issues. Track and transition issue statuses (`Open`, `In Progress`, `Closed`).
* **User Assignment:** Seamlessly assign tasks to specific users within the system.
* **Interactive Dashboard:** Visualize current project metrics and issue statuses at a glance with graphical data representations.
* **Markdown Support:** Rich text editing and rendering for comprehensive issue descriptions.
* **Data Validation:** Strict end-to-end type safety and schema validation using Zod to ensure data integrity.
* **Error Tracking:** Integrated with Sentry for real-time, production-grade bug and performance monitoring.
* **Responsive UI:** A clean, accessible interface built with Tailwind CSS and Radix UI components.

## 🛠 Tech Stack

* **Framework:** Next.js (App Router, RESTful Route Handlers, Server/Client Components)
* **Client Data Fetching:** TanStack React Query & Axios
* **Language:** TypeScript
* **Database:** MySQL
* **ORM:** Prisma
* **Styling & UI:** Tailwind CSS, Radix UI Themes
* **Authentication:** NextAuth.js
* **Monitoring:** Sentry

## ⚙️ Local Setup & Installation

To run this project locally, you will need **Node.js** and a **MySQL** database instance.

### 1. Clone the repository

    git clone https://github.com/harshit-parmar07/issue-tracker.git
    cd issue-tracker

### 2. Install dependencies

    npm install

### 3. Setup Environment Variables

Create a `.env` file in the root directory and add the following keys:

    DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your_secure_random_string_here"
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"
    NEXT_PUBLIC_SENTRY_DSN="your_sentry_dsn_here"

### 4. Database Setup

Push the Prisma schema to your MySQL database to create the required tables:

    npx prisma db push

### 5. Start the Development Server

    npm run dev

Your server should now be running locally on `http://localhost:3000`.

## 🤝 Architecture Note

This application utilizes **Next.js App Router**, taking heavy advantage of React Server Components to minimize client-side JavaScript and deliver fast page loads. Mutations and asynchronous client interactions are handled through Zod-validated **Next.js Route Handlers** paired with **TanStack React Query**, while the data access layer is managed on the server via Prisma ORM.
