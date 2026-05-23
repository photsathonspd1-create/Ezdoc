# 🤖 Section 3: Ready-to-Use Agent Prompts
## EzDoc-Clone — WorkflowOS for Thai SMEs
### Phase 0 → Phase 4 | Production-Ready Prompt Chain

---

> **HOW TO USE THIS DOCUMENT**
> - Feed each prompt **one at a time** to your coding agent (Windsurf / Cursor / Claude Code)
> - **Never combine two phases** in a single session — this causes context drift
> - Each prompt is self-contained: copy it verbatim, paste into a fresh agent session
> - After each phase, run the **Verification Steps** before moving to the next
> - Keep a `CLAUDE.md` file at project root and update it after every phase (template included at end)

---

## ═══════════════════════════════════════
## PHASE 0: Project Setup & Configuration
## ═══════════════════════════════════════

```
╔══════════════════════════════════════════════════════════════════╗
║  PHASE 0 AGENT PROMPT — Project Setup & Configuration           ║
║  Estimated time: 1–2 hours | Context size: XS                   ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are a Senior Full-Stack Engineer specializing in Next.js 14 
production setups. You create clean, scalable project foundations 
that minimize future refactoring. You follow opinionated 
conventions and never leave placeholder code.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bootstrap a production-ready Next.js 14 project called "workflowos" 
with the following complete setup. Execute every step in order:

STEP 1 — Initialize project:
  npx create-next-app@latest workflowos \
    --typescript \
    --tailwind \
    --eslint \
    --app \
    --src-dir \
    --import-alias "@/*"

STEP 2 — Install all dependencies:
  npm install \
    @supabase/supabase-js \
    @supabase/ssr \
    @prisma/client \
    prisma \
    shadcn-ui \
    zustand \
    react-hook-form \
    @hookform/resolvers \
    zod \
    recharts \
    @tiptap/react \
    @tiptap/starter-kit \
    date-fns \
    lucide-react \
    clsx \
    tailwind-merge \
    class-variance-authority \
    @radix-ui/react-slot \
    next-themes \
    sonner \
    @react-pdf/renderer \
    resend \
    axios

  npm install -D \
    @types/node \
    prettier \
    prettier-plugin-tailwindcss \
    eslint-config-prettier

STEP 3 — Initialize shadcn/ui:
  npx shadcn-ui@latest init
  
  When prompted, choose:
  - Style: Default
  - Base color: Slate
  - CSS variables: Yes

  Then install these shadcn components:
  npx shadcn-ui@latest add button card input label select textarea 
    badge avatar dropdown-menu dialog sheet tabs progress toast 
    table skeleton separator popover calendar command

STEP 4 — Create the exact folder structure below. Create every 
folder and every file listed. For files, create them with the 
specified content:

  src/
  ├── app/
  │   ├── (auth)/
  │   │   ├── login/
  │   │   │   └── page.tsx          [empty page component]
  │   │   ├── register/
  │   │   │   └── page.tsx          [empty page component]
  │   │   └── layout.tsx            [auth layout - centered card]
  │   ├── (dashboard)/
  │   │   ├── layout.tsx            [dashboard layout with sidebar]
  │   │   ├── dashboard/
  │   │   │   └── page.tsx          [empty page component]
  │   │   ├── transactions/
  │   │   │   └── page.tsx          [empty page component]
  │   │   ├── projects/
  │   │   │   └── page.tsx          [empty page component]
  │   │   ├── documents/
  │   │   │   └── page.tsx          [empty page component]
  │   │   ├── reports/
  │   │   │   └── page.tsx          [empty page component]
  │   │   └── settings/
  │   │       └── page.tsx          [empty page component]
  │   ├── api/
  │   │   └── health/
  │   │       └── route.ts          [returns { status: "ok" }]
  │   ├── globals.css
  │   ├── layout.tsx
  │   └── page.tsx                  [redirects to /dashboard]
  ├── components/
  │   ├── ui/                       [shadcn auto-generated]
  │   ├── shared/
  │   │   ├── sidebar.tsx           [placeholder]
  │   │   ├── header.tsx            [placeholder]
  │   │   ├── loading-spinner.tsx   [placeholder]
  │   │   └── page-header.tsx       [placeholder]
  │   └── providers/
  │       ├── theme-provider.tsx    [next-themes wrapper]
  │       └── toast-provider.tsx    [sonner toaster]
  ├── lib/
  │   ├── supabase/
  │   │   ├── client.ts             [browser supabase client]
  │   │   ├── server.ts             [server supabase client]
  │   │   └── middleware.ts         [auth middleware helper]
  │   ├── prisma.ts                 [prisma singleton]
  │   ├── utils.ts                  [cn() helper + common utils]
  │   └── constants.ts              [app-wide constants]
  ├── hooks/
  │   ├── use-auth.ts               [placeholder]
  │   └── use-org.ts                [placeholder]
  ├── stores/
  │   ├── auth-store.ts             [zustand auth store]
  │   └── org-store.ts              [zustand org store]
  ├── types/
  │   ├── index.ts                  [barrel export]
  │   ├── auth.ts                   [auth types]
  │   ├── org.ts                    [organization types]
  │   └── transaction.ts            [transaction types]
  └── middleware.ts                 [Next.js middleware for auth]

STEP 5 — Create these configuration files at project root:

  .env.local:
  ─────────────────────────────────────────────
  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

  # Database
  DATABASE_URL=your_supabase_postgresql_connection_string

  # App
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  NEXT_PUBLIC_APP_NAME=WorkflowOS

  # LINE Bot
  LINE_CHANNEL_ACCESS_TOKEN=
  LINE_CHANNEL_SECRET=

  # Anthropic
  ANTHROPIC_API_KEY=

  # Resend
  RESEND_API_KEY=

  # Omise (Thai payment)
  OMISE_PUBLIC_KEY=
  OMISE_SECRET_KEY=
  ─────────────────────────────────────────────

  .prettierrc:
  {
    "semi": false,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5",
    "plugins": ["prettier-plugin-tailwindcss"]
  }

  CLAUDE.md (project root):
  ─────────────────────────────────────────────
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
  Phase 0: Project Setup ✅

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
  ─────────────────────────────────────────────

STEP 6 — Write the actual file content for these critical files:

  src/lib/utils.ts:
  - Export cn() function using clsx + tailwind-merge
  - Export formatCurrency(amount: number): string (Thai Baht format ฿1,234.56)
  - Export formatDate(date: Date | string): string (Thai date format DD/MM/YYYY)
  - Export formatDateThai(date: Date | string): string (Thai Buddhist calendar)

  src/lib/constants.ts:
  - APP_NAME = "WorkflowOS"
  - NAV_ITEMS array with: dashboard, transactions, projects, documents, reports, settings
    Each has: href, labelTh (Thai), icon (lucide icon name)
  - TRANSACTION_TYPES = { INCOME: "income", EXPENSE: "expense" }
  - DOCUMENT_TYPES = { PV: "PV", RV: "RV", INVOICE: "invoice", RECEIPT: "receipt" }
  - PROJECT_STATUS = { PENDING, ACTIVE, COMPLETED, CANCELLED }
  - PAYMENT_STATUS = { UNPAID, PARTIAL, PAID }

  src/lib/supabase/client.ts:
  - createBrowserClient from @supabase/ssr
  - Export singleton pattern

  src/lib/supabase/server.ts:
  - createServerClient from @supabase/ssr
  - Uses cookies() from next/headers

  src/middleware.ts:
  - Protect all /dashboard/* routes
  - Redirect unauthenticated users to /login
  - Redirect authenticated users away from /login to /dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- TypeScript strict mode must be ON in tsconfig.json
- NO JavaScript files — everything is .ts or .tsx
- NO 'any' type anywhere
- Do NOT implement actual auth logic yet — only scaffolding
- Do NOT connect to Supabase yet — only create client files
- Do NOT install packages outside the list above without asking
- All placeholder page components must be valid React components 
  (not empty files) — use a simple "Coming Soon" div with Thai text
- The cn() utility MUST be used for all className merging

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CODE QUALITY REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Every file must have a single-line comment at the top explaining 
  its purpose
- Export types alongside components in the same file or in /types/
- Use 'use client' directive only in files that need browser APIs
- Server components by default (no 'use client' unless required)
- All paths use @/* alias, never relative paths like ../../

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION STEPS — run these after completion
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. `npm run build` — must complete with zero TypeScript errors
2. `npm run dev` — server starts on http://localhost:3000
3. Visit http://localhost:3000 → must redirect to /dashboard
4. Visit http://localhost:3000/dashboard → must redirect to /login 
   (middleware working)
5. Visit http://localhost:3000/api/health → returns {"status":"ok"}
6. `npm run lint` — zero ESLint errors
7. All folder paths listed in STEP 4 must exist exactly as specified
8. Confirm .env.local exists (do NOT commit this file — check .gitignore)
```

---

## ══════════════════════════════════════════════════
## PHASE 1: Database Schema & Supabase Setup
## ══════════════════════════════════════════════════

```
╔══════════════════════════════════════════════════════════════════╗
║  PHASE 1 AGENT PROMPT — Database Schema & Supabase              ║
║  Estimated time: 2–3 hours | Context size: S                    ║
║  Prerequisite: Phase 0 VERIFIED ✅                               ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are a Senior Database Architect specializing in PostgreSQL and 
Prisma ORM for multi-tenant SaaS applications. You design schemas 
that enforce data integrity through proper relations and constraints, 
and implement Row-Level Security correctly in Supabase.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create the complete database schema for the WorkflowOS application. 
This is a multi-tenant Thai SME SaaS. Execute steps in order:

STEP 1 — Create prisma/schema.prisma with this EXACT schema:

  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  // ─── User & Organization ───────────────────────────────

  model User {
    id            String   @id @default(cuid())
    supabaseId    String   @unique @map("supabase_id")
    email         String   @unique
    name          String
    avatarUrl     String?  @map("avatar_url")
    lineUserId    String?  @unique @map("line_user_id")
    phone         String?
    createdAt     DateTime @default(now()) @map("created_at")
    updatedAt     DateTime @updatedAt @map("updated_at")

    memberships   OrgMember[]
    createdTransactions Transaction[]
    createdDocuments    Document[]
    assignedTasks       Task[]

    @@map("users")
  }

  model Organization {
    id          String   @id @default(cuid())
    name        String
    taxId       String?  @map("tax_id")
    address     String?
    logoUrl     String?  @map("logo_url")
    phone       String?
    email       String?
    website     String?
    planTier    PlanTier @default(FREE) @map("plan_tier")
    createdAt   DateTime @default(now()) @map("created_at")
    updatedAt   DateTime @updatedAt @map("updated_at")

    members      OrgMember[]
    contacts     Contact[]
    categories   Category[]
    transactions Transaction[]
    projects     Project[]
    documents    Document[]
    tasks        Task[]
    aiInsights   AiInsight[]

    @@map("organizations")
  }

  model OrgMember {
    id        String   @id @default(cuid())
    orgId     String   @map("org_id")
    userId    String   @map("user_id")
    role      OrgRole  @default(MEMBER)
    joinedAt  DateTime @default(now()) @map("joined_at")

    org  Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
    user User         @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@unique([orgId, userId])
    @@map("org_members")
  }

  // ─── Contacts / Clients ────────────────────────────────

  model Contact {
    id          String      @id @default(cuid())
    orgId       String      @map("org_id")
    name        String
    type        ContactType @default(COMPANY)
    taxId       String?     @map("tax_id")
    address     String?
    email       String?
    phone       String?
    lineUserId  String?     @map("line_user_id")
    notes       String?
    createdAt   DateTime    @default(now()) @map("created_at")
    updatedAt   DateTime    @updatedAt @map("updated_at")

    org      Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
    projects Project[]
    documents Document[]

    @@map("contacts")
  }

  // ─── Categories ────────────────────────────────────────

  model Category {
    id          String          @id @default(cuid())
    orgId       String          @map("org_id")
    name        String
    type        TransactionType
    color       String          @default("#6366f1")
    icon        String          @default("tag")
    isDefault   Boolean         @default(false) @map("is_default")
    createdAt   DateTime        @default(now()) @map("created_at")

    org          Organization  @relation(fields: [orgId], references: [id], onDelete: Cascade)
    transactions Transaction[]

    @@map("categories")
  }

  // ─── Transactions ──────────────────────────────────────

  model Transaction {
    id            String          @id @default(cuid())
    orgId         String          @map("org_id")
    type          TransactionType
    amount        Decimal         @db.Decimal(12, 2)
    vatRate       Decimal         @default(7) @db.Decimal(5, 2) @map("vat_rate")
    vatAmount     Decimal         @default(0) @db.Decimal(12, 2) @map("vat_amount")
    amountExVat   Decimal         @default(0) @db.Decimal(12, 2) @map("amount_ex_vat")
    description   String
    categoryId    String?         @map("category_id")
    date          DateTime
    paymentMethod String?         @map("payment_method")
    status        TxStatus        @default(COMPLETED)
    receiptUrl    String?         @map("receipt_url")
    documentId    String?         @map("document_id")
    projectId     String?         @map("project_id")
    createdById   String          @map("created_by_id")
    notes         String?
    createdAt     DateTime        @default(now()) @map("created_at")
    updatedAt     DateTime        @updatedAt @map("updated_at")

    org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
    category  Category?    @relation(fields: [categoryId], references: [id])
    createdBy User         @relation(fields: [createdById], references: [id])

    @@index([orgId, date])
    @@index([orgId, type])
    @@map("transactions")
  }

  // ─── Projects ──────────────────────────────────────────

  model Project {
    id            String        @id @default(cuid())
    orgId         String        @map("org_id")
    name          String
    clientId      String?       @map("client_id")
    status        ProjectStatus @default(PENDING)
    budget        Decimal?      @db.Decimal(12, 2)
    paidAmount    Decimal       @default(0) @db.Decimal(12, 2) @map("paid_amount")
    paymentStatus PayStatus     @default(UNPAID) @map("payment_status")
    startDate     DateTime?     @map("start_date")
    dueDate       DateTime?     @map("due_date")
    tags          String[]      @default([])
    notes         String?
    createdAt     DateTime      @default(now()) @map("created_at")
    updatedAt     DateTime      @updatedAt @map("updated_at")

    org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
    client    Contact?     @relation(fields: [clientId], references: [id])
    documents Document[]
    tasks     Task[]

    @@index([orgId, status])
    @@index([orgId, dueDate])
    @@map("projects")
  }

  // ─── Documents ─────────────────────────────────────────

  model Document {
    id          String       @id @default(cuid())
    orgId       String       @map("org_id")
    projectId   String?      @map("project_id")
    clientId    String?      @map("client_id")
    type        DocumentType
    docNumber   String       @map("doc_number")
    status      DocStatus    @default(DRAFT)
    issuedDate  DateTime     @map("issued_date")
    dueDate     DateTime?    @map("due_date")
    items       Json
    subtotal    Decimal      @db.Decimal(12, 2)
    vatAmount   Decimal      @default(0) @db.Decimal(12, 2) @map("vat_amount")
    total       Decimal      @db.Decimal(12, 2)
    pdfUrl      String?      @map("pdf_url")
    notes       String?
    createdById String       @map("created_by_id")
    createdAt   DateTime     @default(now()) @map("created_at")
    updatedAt   DateTime     @updatedAt @map("updated_at")

    org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
    project   Project?     @relation(fields: [projectId], references: [id])
    client    Contact?     @relation(fields: [clientId], references: [id])
    createdBy User         @relation(fields: [createdById], references: [id])

    @@unique([orgId, docNumber])
    @@index([orgId, type])
    @@map("documents")
  }

  // ─── Tasks ─────────────────────────────────────────────

  model Task {
    id          String     @id @default(cuid())
    orgId       String     @map("org_id")
    projectId   String?    @map("project_id")
    title       String
    description String?
    assigneeId  String?    @map("assignee_id")
    dueDate     DateTime?  @map("due_date")
    status      TaskStatus @default(PENDING)
    priority    Priority   @default(MEDIUM)
    createdAt   DateTime   @default(now()) @map("created_at")
    updatedAt   DateTime   @updatedAt @map("updated_at")

    org      Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
    project  Project?     @relation(fields: [projectId], references: [id])
    assignee User?        @relation(fields: [assigneeId], references: [id])

    @@map("tasks")
  }

  // ─── AI & Insights ─────────────────────────────────────

  model AiInsight {
    id        String   @id @default(cuid())
    orgId     String   @map("org_id")
    type      String
    title     String
    content   String
    metadata  Json?
    isRead    Boolean  @default(false) @map("is_read")
    createdAt DateTime @default(now()) @map("created_at")

    org Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

    @@map("ai_insights")
  }

  // ─── Enums ─────────────────────────────────────────────

  enum PlanTier {
    FREE
    PRO
    BUSINESS
  }

  enum OrgRole {
    OWNER
    ADMIN
    MEMBER
  }

  enum ContactType {
    PERSON
    COMPANY
  }

  enum TransactionType {
    INCOME
    EXPENSE
  }

  enum TxStatus {
    PENDING
    COMPLETED
    CANCELLED
  }

  enum ProjectStatus {
    PENDING
    ACTIVE
    COMPLETED
    CANCELLED
  }

  enum PayStatus {
    UNPAID
    PARTIAL
    PAID
  }

  enum DocumentType {
    PV
    RV
    INVOICE
    RECEIPT
    QUOTATION
  }

  enum DocStatus {
    DRAFT
    PENDING_APPROVAL
    APPROVED
    REJECTED
    PAID
    CANCELLED
  }

  enum TaskStatus {
    PENDING
    IN_PROGRESS
    DONE
    CANCELLED
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

STEP 2 — Run Prisma migrations:
  npx prisma generate
  npx prisma migrate dev --name init

STEP 3 — Create src/lib/prisma.ts singleton:
  - Global prisma client to avoid connection pool exhaustion in dev
  - TypeScript properly typed

STEP 4 — Create seed file prisma/seed.ts:
  Create seed data for a demo organization "บริษัท ยูนิซิน จำกัด":
  - 1 organization record
  - 1 user (owner)
  - 1 OrgMember linking them
  - Default income categories: รายได้จากบริการ, ขายสินค้า, รายได้อื่นๆ
  - Default expense categories: เงินเดือนพนักงาน, ค่าวัตถุดิบ, ค่าการตลาด, 
    ค่าเช่า, สาธารณูปโภค, อื่นๆ
  - 10 sample transactions (mix of income and expense) with realistic 
    Thai business amounts (10,000–500,000 THB range)
  - 2 sample projects
  - 2 sample contacts (Thai company names)

  Add to package.json scripts:
  "prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} 
              prisma/seed.ts" }

STEP 5 — Update src/types/ with TypeScript types derived from Prisma schema:

  src/types/transaction.ts:
  - Export TransactionWithCategory type (Transaction + category relation)
  - Export CreateTransactionInput (Zod schema for form validation)
  - Export UpdateTransactionInput

  src/types/project.ts:
  - Export ProjectWithClient type (Project + contact relation)  
  - Export CreateProjectInput
  - Export UpdateProjectInput

  src/types/document.ts:
  - Export DocumentLineItem type (for the items JSON field)
  - Export DocumentWithRelations type
  - Export CreateDocumentInput

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Schema must match the above exactly — do NOT add or remove fields
- All monetary fields use Decimal (not Float) to avoid floating-point errors
- All table names use snake_case via @@map()
- All column names use snake_case via @map()
- Cascade deletes must be set exactly as shown above
- The seed script must use upsert to be safe to run multiple times
- Do NOT implement RLS policies yet — that is Phase 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. `npx prisma validate` — no schema errors
2. `npx prisma migrate dev` — migration runs clean
3. `npx prisma db seed` — seed completes without errors
4. `npx prisma studio` — open and verify all tables exist with seed data
5. `npx prisma generate` — client generated without type errors
6. `npm run build` — still compiles without TypeScript errors
7. Check Supabase dashboard → Table Editor shows all tables
8. Confirm 12 tables exist: users, organizations, org_members, contacts, 
   categories, transactions, projects, documents, tasks, ai_insights
```

---

## ═════════════════════════════════════════
## PHASE 2: Authentication (Email + LINE)
## ═════════════════════════════════════════

```
╔══════════════════════════════════════════════════════════════════╗
║  PHASE 2 AGENT PROMPT — Authentication System                   ║
║  Estimated time: 3–4 hours | Context size: S                    ║
║  Prerequisite: Phase 1 VERIFIED ✅                               ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are a Security-focused Full-Stack Engineer with deep expertise 
in Supabase Auth and Next.js 14 App Router authentication patterns. 
You implement auth that is secure by default, handles all edge cases, 
and provides excellent UX with proper loading states.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build the complete authentication system. All UI text must be in Thai.

STEP 1 — Supabase Auth Configuration:
  Create src/lib/supabase/middleware.ts:
  - updateSession() function that refreshes expired tokens
  - Uses createServerClient with cookie handlers
  
  Update src/middleware.ts:
  - Call updateSession() on every request
  - Protect routes: /dashboard/*, /transactions/*, /projects/*, 
    /documents/*, /reports/*, /settings/*
  - Public routes: /login, /register, /auth/callback, /api/health, 
    /api/line/*
  - Redirect logic:
    - Unauthenticated → /login (with ?redirect= param to return after)
    - Authenticated accessing /login or /register → /dashboard

STEP 2 — Auth API Route Handlers:

  src/app/api/auth/callback/route.ts:
  - Handle Supabase OAuth callback (for LINE OAuth)
  - Exchange code for session
  - On new user: create User record in Prisma + create default org
  - Redirect to /dashboard or /onboarding (if new user)

  src/app/api/auth/signout/route.ts:
  - POST handler — signs out via Supabase
  - Clears cookies
  - Returns redirect to /login

STEP 3 — Zustand Auth Store (src/stores/auth-store.ts):
  State:
  - user: User | null (Prisma User type)
  - supabaseUser: SupabaseUser | null
  - isLoading: boolean
  - isAuthenticated: boolean
  
  Actions:
  - setUser(user: User | null)
  - setSupabaseUser(user: SupabaseUser | null)
  - setLoading(loading: boolean)
  - reset() — clears all state on logout

STEP 4 — Custom hook src/hooks/use-auth.ts:
  - useAuth() hook that reads from Zustand auth store
  - signIn(email, password): Promise<{error?: string}>
  - signUp(email, password, name): Promise<{error?: string}>
  - signOut(): Promise<void>
  - signInWithLine(): Promise<void> — triggers LINE OAuth
  - All functions set loading state appropriately

STEP 5 — Login Page (src/app/(auth)/login/page.tsx):
  Build a complete, beautiful login page:
  
  Layout: Centered card, max-w-md, with:
  - WorkflowOS logo + ชื่อแอพ at top
  - ยินดีต้อนรับกลับมา! subtitle
  
  Form fields (React Hook Form + Zod):
  - อีเมล: email input with validation
  - รหัสผ่าน: password input with show/hide toggle
  - ลืมรหัสผ่าน? link (placeholder)
  - เข้าสู่ระบบ button (full width, shows spinner on loading)
  - ─── หรือ ─── divider
  - เข้าสู่ระบบด้วย LINE button (green, LINE icon)
  - ยังไม่มีบัญชี? สมัครสมาชิก link → /register
  
  Error handling:
  - Show error toast on failed login
  - Disable button during loading
  - Clear errors when user starts typing again

STEP 6 — Register Page (src/app/(auth)/register/page.tsx):
  
  Form fields (React Hook Form + Zod):
  - ชื่อ-นามสกุล: text input
  - อีเมล: email input
  - รหัสผ่าน: password with strength indicator
  - ยืนยันรหัสผ่าน: confirm password match validation
  - ✅ ยอมรับข้อกำหนดการใช้งาน: checkbox
  - สมัครสมาชิก button
  - มีบัญชีแล้ว? เข้าสู่ระบบ link

  After successful register:
  - Show "กรุณาตรวจสอบอีเมลของคุณ" success state
  - Do NOT auto-redirect (wait for email verification)

STEP 7 — Auth Layout (src/app/(auth)/layout.tsx):
  - Gradient background (subtle blue/slate)
  - Centered content with logo
  - Already logged-in guard: if user session exists, redirect /dashboard

STEP 8 — Auth initialization in root layout:
  Create src/components/providers/auth-provider.tsx:
  - 'use client' component
  - On mount: check Supabase session
  - Subscribe to onAuthStateChange
  - When session exists: fetch User from /api/user/me
  - Sync to Zustand store
  
  src/app/api/user/me/route.ts:
  - GET: returns current user's Prisma User record
  - Requires auth session (check Supabase server session)
  - If user doesn't exist in Prisma yet, create it

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- All Supabase client operations in server components use the 
  server client; browser components use the browser client
- Never store JWT tokens in localStorage — use Supabase cookie sessions
- All auth error messages must be in Thai
- Form validation happens client-side AND server-side
- The password field must never log to console
- LINE OAuth requires NEXT_PUBLIC_SUPABASE_URL to be configured —
  if not configured, hide the LINE button and add a console.warn
- React Hook Form must be used — no manual state management for forms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Visit /login — page renders without errors, all Thai text
2. Try login with wrong password → error toast in Thai
3. Register new account → check email verification flow
4. After login → redirected to /dashboard
5. Open new tab to /login while logged in → redirects to /dashboard
6. Visit /dashboard while logged out → redirects to /login
7. Check Supabase Auth dashboard → user appears after registration
8. `npm run build` — no TypeScript errors
```

---

## ═══════════════════════════════════════════════════
## PHASE 3: Organization Onboarding & Settings
## ═══════════════════════════════════════════════════

```
╔══════════════════════════════════════════════════════════════════╗
║  PHASE 3 AGENT PROMPT — Organization Onboarding                 ║
║  Estimated time: 2–3 hours | Context size: S                    ║
║  Prerequisite: Phase 2 VERIFIED ✅                               ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are a UX-focused Full-Stack Engineer who understands that 
onboarding is the user's first impression of the product. You build 
smooth, guided flows that collect the minimum required information 
and make users feel progress at every step.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build the organization setup flow and settings page.

STEP 1 — Org Zustand Store (src/stores/org-store.ts):
  State:
  - currentOrg: Organization | null
  - orgs: Organization[] (list of orgs user belongs to)
  - isLoading: boolean
  
  Actions:
  - setCurrentOrg(org: Organization | null)
  - setOrgs(orgs: Organization[])
  - getCurrentOrg(): Organization | null

STEP 2 — Org Hook (src/hooks/use-org.ts):
  - useOrg() — returns currentOrg + loading state
  - switchOrg(orgId: string): Promise<void>
  - fetchUserOrgs(): Promise<void>

STEP 3 — API Routes:

  src/app/api/orgs/route.ts:
  GET:  Returns all organizations the current user is a member of
  POST: Creates a new organization + adds creator as OWNER

  src/app/api/orgs/[orgId]/route.ts:
  GET:    Returns single org (only if user is a member)
  PATCH:  Updates org details (only OWNER/ADMIN)
  DELETE: Deletes org (only OWNER, requires confirmation)

  src/app/api/orgs/[orgId]/members/route.ts:
  GET:  Returns all members with their roles
  POST: Invites a new member by email

STEP 4 — Onboarding Page (src/app/onboarding/page.tsx):
  
  This is shown to new users who don't have an organization yet.
  3-step wizard with progress bar:

  Step 1 — ตั้งค่าบริษัท (Company Setup):
  - ชื่อบริษัท/ร้านค้า * (required)
  - เลขประจำตัวผู้เสียภาษี (tax ID, optional)
  - ที่อยู่ (address, optional textarea)
  - เบอร์โทรศัพท์
  - อีเมลสำหรับธุรกิจ
  
  Step 2 — อัปโหลดโลโก้ (optional):
  - Drag-and-drop or click to upload image
  - Preview with crop (just show preview, no actual crop needed)
  - ข้ามขั้นตอนนี้ button
  
  Step 3 — เสร็จสิ้น! (Done):
  - Summary of what was set up
  - ไปที่แดชบอร์ด button → /dashboard

STEP 5 — Settings Page (src/app/(dashboard)/settings/page.tsx):
  
  Tab layout with 3 tabs:
  
  Tab 1: ข้อมูลบริษัท (Company Info):
  - Same fields as onboarding Step 1
  - Logo upload section
  - บันทึก button

  Tab 2: สมาชิก (Members):
  - Table: avatar | ชื่อ | อีเมล | สิทธิ์ | วันที่เข้าร่วม | จัดการ
  - Invite button → dialog with email input + role selector
  - Remove member button (with confirmation dialog)
  - Role badges: เจ้าของ (OWNER), ผู้ดูแล (ADMIN), สมาชิก (MEMBER)

  Tab 3: แผนการใช้งาน (Subscription):
  - Current plan display (Free/Pro/Business)
  - Feature comparison table
  - อัปเกรด button (placeholder, disabled)

STEP 6 — Org Switcher Component 
  (src/components/shared/org-switcher.tsx):
  - Shows current org name + logo/initials
  - Dropdown lists all user's orgs
  - + สร้างองค์กรใหม่ option at bottom
  - Used in the sidebar header area

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Organization ID must be passed in every API request to prevent 
  cross-org data leakage — use X-Org-Id header or orgId in URL
- Logo upload should use Supabase Storage — store in bucket "logos"
- File size limit: 2MB for logo
- Accepted file types: jpg, png, webp only
- All text in Thai
- Onboarding wizard state should survive page refresh 
  (store step in URL params: ?step=1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. New user → redirect to /onboarding → complete wizard → lands /dashboard
2. Create org via API → appears in Supabase table
3. Settings page loads with correct org data
4. Update org name → verify in DB via Prisma Studio
5. Settings tabs switch without page reload
6. Org switcher shows all user's orgs in dropdown
7. `npm run build` — no errors
```

---

## ═══════════════════════════════════════════
## PHASE 4: Core Dashboard UI
## ═══════════════════════════════════════════

```
╔══════════════════════════════════════════════════════════════════╗
║  PHASE 4 AGENT PROMPT — Core Dashboard UI                       ║
║  Estimated time: 4–5 hours | Context size: M                    ║
║  Prerequisite: Phase 3 VERIFIED ✅                               ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are a Senior UI Engineer who has built commercial SaaS dashboards 
for Thai businesses. You produce pixel-perfect, polished interfaces 
with excellent attention to data hierarchy, Thai typography, and 
micro-interactions. Your code is clean and component-driven.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reference the EzDoc platform design from the screenshots:
- Clean white background with soft card surfaces
- Blue primary color (#2563eb) for interactive elements
- Green for income/positive values  
- Red for expenses/negative values
- Orange for warnings/pending states
- Consistent card-based layout with subtle shadows
- Thai language throughout with Sarabun or Noto Sans Thai font

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build the complete dashboard shell and main dashboard page. 
Build UI with mock data first — API integration is Phase 5+.

STEP 1 — Global Font Setup (src/app/globals.css + layout.tsx):
  Add Google Fonts for Thai:
  - Sarabun (300, 400, 500, 600) — primary Thai font
  - Set as default font-family in Tailwind config
  - Override shadcn default font
  
  In tailwind.config.ts:
  - Extend fontFamily: { sans: ['Sarabun', 'sans-serif'] }

STEP 2 — Dashboard Layout (src/app/(dashboard)/layout.tsx):
  
  Build a full-height two-column layout:
  
  LEFT SIDEBAR (fixed, w-64):
  ┌─────────────────────────────┐
  │  [Logo] WorkflowOS          │
  │  [OrgSwitcher component]    │
  │  ─────────────────────────  │
  │  ► ภาพรวม (Dashboard)       │
  │  ▷ รายการเงิน               │
  │  ▷ งาน/โปรเจกต์             │
  │  ▷ เอกสาร                   │
  │  ▷ รายงาน                   │
  │  ─────────────────────────  │
  │  ▷ ตั้งค่า                  │
  │  ─────────────────────────  │
  │  [Avatar] [Name]            │
  │  [Plan Badge] Gold member   │
  └─────────────────────────────┘
  
  Active nav item: blue left border + blue text + light blue bg
  Inactive: gray text + transparent bg
  Hover: light gray bg transition
  
  MAIN CONTENT (flex-1, scrollable):
  - Sticky top header bar (h-16) with:
    - Page title (dynamic)
    - Notification bell (with red dot badge)
    - Current month/year display
    - User avatar dropdown menu

STEP 3 — Sidebar Component (src/components/shared/sidebar.tsx):
  'use client' component with:
  - usePathname() for active state
  - Collapse button (hide text, show only icons)
  - Smooth CSS transition for collapse
  - Bottom user profile section with logout option
  - Mobile: hidden by default, shown via sheet/drawer

STEP 4 — Header Component (src/components/shared/header.tsx):
  - PageHeader with dynamic title prop
  - Notifications icon (bell with badge)
  - Month selector (show current month in Thai: "พฤษภาคม 2568")
  - Avatar with dropdown: โปรไฟล์, ตั้งค่า, ออกจากระบบ

STEP 5 — Dashboard Page API Route:

  src/app/api/dashboard/summary/route.ts:
  GET: Returns dashboard summary data for current org
  Query params: ?month=2026-05&orgId=xxx
  
  Returns:
  {
    currentMonth: {
      income: number,         // รายรับ
      expense: number,        // รายจ่าย
      profit: number,         // กำไรสุทธิ
      cashBalance: number,    // เงินคงเหลือ
      incomeMoM: number,      // % vs last month
      expenseMoM: number,
      margin: number          // profit margin %
    },
    vat: {
      incomeWithVat: number,
      incomeExVat: number,
      vatPayable: number,
      inputVat: number,
      outputVat: number
    },
    trends: Array<{
      month: string,          // "ม.ค.", "ก.พ.", etc.
      income: number,
      expense: number,
      profit: number
    }>,                       // Last 6 months
    topProducts: Array<{
      rank: number,
      name: string,
      revenue: number,
      profit: number,
      margin: number
    }>,                       // Top 5
    expenseBreakdown: Array<{
      category: string,
      amount: number,
      isAlert: boolean        // true if increased >20% MoM
    }>,
    recentTransactions: Array<Transaction>,
    aiInsights: Array<AiInsight>
  }

  For now, return MOCK DATA matching the structure above. Use 
  realistic Thai business data (amounts in THB, Thai month names).
  Comment: // TODO: Replace with real DB query in Phase 5

STEP 6 — Dashboard Page UI (src/app/(dashboard)/dashboard/page.tsx):
  
  Server component that fetches summary data. Use mock data via 
  the API route created above. Build these sections:

  6A. TOP SECTION — ภาพรวมธุรกิจ [Month]:
  4 stat cards in a row:
  - รายรับ (Income): amount in green, +X% MoM chip
  - รายจ่าย (Expense): amount in red, +X% MoM chip  
  - กำไรสุทธิ (Net Profit): amount in blue, Margin X%
  - เงินคงเหลือ (Cash Balance): amount, สภาพคล่องดี badge

  6B. RIGHT PANEL — ภาพรวมภาษี (VAT Summary):
  Card with:
  - รายได้รวม VAT
  - รายได้ไม่รวม VAT
  - VAT ที่ต้องส่ง
  - ภาษีซื้อ / ภาษีขาย (Input/Output VAT)
  VAT due date reminder if within 30 days

  6C. CENTER — แนวโน้มรายรับ รายจ่าย และกำไร:
  Recharts LineChart:
  - X-axis: Thai month abbreviations (ม.ค., ก.พ., ...)
  - 3 lines: income (blue), expense (red), profit (green dashed)
  - Custom Thai tooltip showing values
  - Legend below chart
  - Height: 280px

  Below chart — 4 average cards:
  - รายรับเฉลี่ยต่อเดือน (avg income)
  - รายจ่ายเฉลี่ยต่อเดือน (avg expense)
  - กำไรเฉลี่ยต่อเดือน (avg profit)
  - Margin เฉลี่ย (avg margin %)

  6D. BOTTOM LEFT — วิเคราะห์ค่าใช้จ่าย:
  List of expense categories with:
  - Progress bar (relative to total expenses)
  - Amount on right
  - Red "↑" alert icon for categories with >20% MoM increase

  6E. BOTTOM CENTER — วิเคราะห์สินค้า/บริการ:
  Table with top 5 products/services:
  - ลำดับ | สินค้า | ยอดขาย | กำไร | สัดส่วนกำไร
  - Subtle row hover effect

  6F. BOTTOM RIGHT — EzDoc วิเคราะห์ธุรกิจ:
  AI Insights panel:
  - 3 insight cards with icons
  - Color-coded by type: 
    green=positive trend, orange=warning, blue=reminder
  - Timestamp (X นาทีที่แล้ว / X วันที่แล้ว)

STEP 7 — Reusable components to create:

  src/components/shared/stat-card.tsx:
  Props: title, value, subtitle, trend?, trendLabel?, icon?, color?
  
  src/components/shared/page-header.tsx:
  Props: title, subtitle?, actions? (ReactNode for CTA buttons)
  
  src/components/shared/loading-skeleton.tsx:
  Skeleton variants: card, chart, table-row
  
  src/components/shared/empty-state.tsx:
  Props: icon, title, description, action?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Dashboard page is a Server Component — fetch data server-side
- ALL currency displayed as Thai Baht: ฿1,234,567.00
- ALL dates in Thai Buddhist calendar (พ.ศ.) or Thai month names
- Chart colors: income = #22c55e (green), expense = #ef4444 (red), 
  profit = #3b82f6 (blue)
- MoM percentage: green if positive income growth, 
  red if expense increase
- Mobile responsive: sidebar collapses to hamburger on <768px
- Use Skeleton components during loading states
- Do NOT connect real data yet — mock data from API route only
- No real-time subscriptions yet — static fetch is fine
- TypeScript: all props interfaces must be defined, no 'any'
- All amounts must use formatCurrency() from src/lib/utils.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Visit /dashboard — page loads with all sections visible
2. All 6 dashboard sections render with mock Thai data
3. Line chart renders with 3 colored lines and Thai labels
4. Sidebar navigation highlights correct active page
5. Click each nav item — navigates to correct route
6. Resize browser to 768px — sidebar collapses to hamburger
7. VAT summary card shows correct calculations
8. Currency formatted as ฿X,XXX,XXX.XX throughout
9. `npm run build` — zero errors, zero TypeScript warnings
10. Lighthouse score: Performance > 85, Accessibility > 90
```

---

## 📋 CLAUDE.md — Update After Each Phase

After completing each phase, paste this updated CLAUDE.md into your project root to give the next agent session proper context:

```markdown
# WorkflowOS — CLAUDE.md (Update this after each phase)

## Project Summary
Thai SME Workflow & Document Management SaaS (EzDoc-clone)
URL: localhost:3000 (dev) | Stack: Next.js 14 + Supabase + Prisma + Tailwind + shadcn/ui

## Phases Completed
- [x] Phase 0: Project Setup
- [x] Phase 1: Database Schema  
- [x] Phase 2: Authentication
- [x] Phase 3: Org Onboarding
- [x] Phase 4: Dashboard UI
- [ ] Phase 5: Transactions
- [ ] Phase 6: Documents
- [ ] Phase 7: Projects
- [ ] Phase 8: Reports
- [ ] Phase 9: LINE Bot
- [ ] Phase 10: AI Insights

## Key Files Reference
- Auth: src/middleware.ts + src/app/(auth)/ + src/stores/auth-store.ts
- Dashboard: src/app/(dashboard)/layout.tsx + src/app/(dashboard)/dashboard/
- API: src/app/api/ (all route handlers)
- DB: prisma/schema.prisma + src/lib/prisma.ts
- Types: src/types/ (all TypeScript types)
- Utils: src/lib/utils.ts (cn, formatCurrency, formatDate)
- Constants: src/lib/constants.ts (NAV_ITEMS, enums, etc.)

## Critical Rules
1. Thai language for ALL user-facing text
2. All monetary values: Decimal type in DB, formatted as ฿X,XXX.XX in UI
3. Multi-tenant: always scope DB queries by orgId
4. Never use 'any' TypeScript type
5. Server Components by default; 'use client' only when needed
6. All forms: React Hook Form + Zod validation
7. Currency: formatCurrency() from @/lib/utils
8. Dates: Thai Buddhist calendar (พ.ศ.) display

## DB Schema Quick Reference
Tables: users, organizations, org_members, contacts, categories,
        transactions, projects, documents, tasks, ai_insights
Key enums: TransactionType(INCOME/EXPENSE), ProjectStatus, DocumentType(PV/RV/INVOICE), PayStatus

## Current Known Issues / TODOs
- Dashboard page uses mock data — real queries in Phase 5
- LINE OAuth not configured (needs LINE Developer Console setup)
- PDF generation not yet implemented
```

---

## 🚦 Phase Execution Checklist

| Phase | Status | Key Output | Test URL |
|-------|--------|-----------|----------|
| 0: Setup | ☐ | Project scaffolding | /api/health |
| 1: Database | ☐ | Prisma schema + seed | Prisma Studio |
| 2: Auth | ☐ | Login/Register pages | /login |
| 3: Org | ☐ | Onboarding wizard | /onboarding |
| 4: Dashboard | ☐ | Full dashboard UI | /dashboard |

> **Remember:** Only move to the next phase after ALL verification 
> steps for the current phase pass. Don't skip verifications!
```
