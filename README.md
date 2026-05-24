
<div align="center">
   <h1>🤖 Multi Agent Voice System 🎤</h1>
   <p>
      <img src="https://img.shields.io/badge/Next.js-React-blue?logo=nextdotjs" alt="Next.js" />
      <img src="https://img.shields.io/badge/Express.js-Backend-green?logo=express" alt="Express.js" />
      <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql" alt="PostgreSQL" />
      <img src="https://img.shields.io/badge/TypeScript-TypeSafe-blue?logo=typescript" alt="TypeScript" />
      <img src="https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel" alt="Vercel" />
   </p>
   <p><b>AI-powered multi-agent voice system for modern businesses</b></p>
   <p>Admin & user dashboards • Voice agent configuration • Analytics • VAPI integration</p>
</div>

---

Welcome to the <b>Multi Agent Voice System</b>! This is a full-stack platform for building, managing, and deploying AI voice agents for business use. It features:

• Modern Next.js/React frontend
• Robust Node.js/Express backend
• Secure authentication & role-based access
• Real-time analytics and reporting
• Flexible agent configuration (type, voice, prompts)
• VAPI-powered voice AI (with graceful fallback)

## Live Demo

[https://multi-agent-voice-ai-system.vercel.app/](https://multi-agent-voice-ai-system.vercel.app/)

## Tech Stack

**Frontend (client):**

- Next.js (React framework)
- React 18
- TypeScript
- shadcn/ui (UI components)
- Tailwind CSS (utility-first CSS)
- Lucide React (icons)
- Axios (HTTP client)
- Zustand (state management)

**Backend (server):**

- Node.js
- Express.js
- TypeScript
- Drizzle ORM (database ORM)
- PostgreSQL (database)
- bcryptjs (password hashing)
- JWT (authentication)
- Nodemon (development)

**Other:**

- Vercel (deployment)
- Backend (Render(freetier))
- Database (NeonDB)
- pnpm (package manager)
- ESLint & Prettier (linting/formatting)


## Project Structure

- `client/` — Next.js frontend (React, shadcn/ui, custom components)
- `server/` — Node.js backend (Express, Drizzle ORM, authentication, API routes)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (or npm/yarn)
- PostgreSQL (or your configured database)

### Setup

1. **Install dependencies**

   ```sh
   cd client
   pnpm install
   cd ../server
   pnpm install
   ```

2. **Configure environment variables**
   - Copy `.env.example` to `.env` in both `client/` and `server/` and fill in required values.

3. **Database setup**
   - Run migrations and seed data:
     ```sh
     cd server
     pnpm run db:push
     pnpm run seed
     ```

4. **Run the development servers**
   - In two terminals:
     ```sh
     cd client && pnpm dev
     cd server && pnpm dev
     ```

## Features

### Admin Features

- Admin dashboard with overview statistics
- Manage (create, edit, delete) users
- Manage (create, edit, delete, activate/deactivate) all agents
- View and filter all agents with details
- View and filter all calls with details
- Analytics: user growth, plan distribution, call statistics, usage charts
- Block/unblock users
- Assign user plans (free, starter, pro)
- View and manage agent types and voices

### User Features

- User dashboard with personal agent overview
- Create, edit, and delete personal AI voice agents
- Configure agent type (receptionist, appointment, FAQ)
- Select and preview agent voice
- Set system prompt and first message for agent
- Activate/deactivate own agents
- View call history and details
- Authentication (login/register/logout)
- Profile management

### Voice Agent Features

- Multiple agent types (receptionist, appointment, FAQ)
- Multiple voice options (shimmer, alloy, echo, nova, onyx, fable)
- Customizable system prompt and greeting
- First message customization
- Voice agent status (active/inactive)
- VAPI integration for voice and AI

### General

- Responsive UI (desktop/mobile)
- Modern UI with shadcn/ui and Tailwind CSS
- Secure authentication and authorization
- Environment-based configuration
- Error handling and inline feedback
- Live demo deployment (Vercel)

## Note on VAPI Integration

This system is built to leverage the VAPI platform for AI voice and assistant capabilities. While the core application and UI are fully functional, some advanced features—such as real-time voice synthesis, call handling, and certain agent automations—depend on the availability and configuration of VAPI services. If VAPI is not accessible or not fully configured, some features may be limited or unavailable. The application is designed to degrade gracefully, and all other management, configuration, and analytics features will continue to work as expected.

## Scripts

See each `package.json` for available scripts.

## License

All Right Reserved
