# WorkflowOS — Project Context for AI Agents

## What this project is
Thai SME Workflow & Document Management SaaS (similar to EzDoc).
Features: Income/Expense tracking, Document generation (PV/RV/Invoice),
Project management, LINE Bot integration, AI insights.

## Tech Stack
- Next.js 14 App Router + TypeScript
- Supabase (Auth + PostgreSQL + Storage)
- Prisma ORM
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- React Hook Form + Zod (forms/validation)

## Current Phase Completed
- [x] Phase 0-4: Project Setup, DB Schema, Auth, Onboarding, Dashboard UI
- [x] Phase 5: Transactions (CRUD) & Real-time Dashboard Integration
- [x] Phase 6: Documents (API & List View) & Contacts API

## Folder Conventions
- /app/(auth)/ — public auth pages
- /app/(dashboard)/ — protected app pages
- /components/shared/ — reusable layout components
- /lib/ — utilities, supabase, prisma clients
- /stores/ — zustand global stores
- /types/ — TypeScript type definitions

## Naming Conventions
- Files: kebab-case (e.g., user-profile.tsx)
- Components: PascalCase (e.g., UserProfile)
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Database tables: snake_case

## Key Rules
1. Never use 'any' type in TypeScript
2. All forms use React Hook Form + Zod schema
3. All API calls in /app/api/ route handlers only
4. Thai language for all UI labels
5. Always handle loading and error states in UI
