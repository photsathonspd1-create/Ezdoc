# 🎨 WorkflowOS — UX/UI Overhaul Prompt
## Agent: Windsurf / Cursor / Claude Code
## Priority: Execute ALL steps in order. Do NOT skip any step.

---

```
╔══════════════════════════════════════════════════════════════════════╗
║  UX/UI COMPLETE OVERHAUL AGENT PROMPT                               ║
║  Repo: photsathonspd1-create/Ezdoc                                  ║
║  Focus: Design consistency, typography, layout, accessibility        ║
╚══════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are a Senior UI/UX Engineer specializing in Thai SaaS dashboards 
and design systems. You produce clean, professional, pixel-consistent 
interfaces with excellent information hierarchy. You fix issues 
methodically without breaking existing functionality.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN PRINCIPLES TO ENFORCE THROUGHOUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Typography hierarchy: heading=font-bold(700), label=font-semibold(600),
   body=font-normal(400), muted=font-normal text-slate-400
   — NEVER font-black(900) on body text, table cells, or descriptions
2. Border radius system: card=rounded-xl(12px), modal=rounded-2xl(16px),
   button=rounded-lg(8px), pill/badge=rounded-full
   — NO ad-hoc rounded-[2rem] or rounded-[2.5rem] anywhere
3. Color semantics: income=green-600, expense=red-600, profit=blue-600,
   warning=amber-500, neutral=slate-600
4. Spacing: page padding=p-6 (not p-8), section gaps=space-y-6 (not space-y-8),
   card padding=p-5
5. Primary color = blue-600 (#2563eb) — must match shadcn --primary token

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK — Execute these 10 fixes in order
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

══════════════════════════════════════════════
FIX 1 — CRITICAL: Security (.env leak)
File: .gitignore + git commands
══════════════════════════════════════════════

Run these git commands:
  git rm --cached .env
  echo ".env" >> .gitignore
  echo ".env.local" >> .gitignore

Update .gitignore to include at the "local env files" section:
  # local env files
  .env
  .env.local
  .env*.local
  .env.development
  .env.production

Then commit:
  git add .gitignore
  git commit -m "security: remove .env from git tracking"

IMPORTANT: Tell the user they MUST manually rotate these keys:
- DATABASE_URL (Supabase → Settings → Database → Reset password)
- OPENAI_API_KEY (platform.openai.com → API Keys → Delete & create new)


══════════════════════════════════════════════
FIX 2 — Design Tokens: globals.css overhaul
File: src/app/globals.css
══════════════════════════════════════════════

PROBLEM: 
- --primary token is black (oklch 0.205), not blue
- global input/textarea/select override with !important breaks
  shadcn's focus ring and error state validation styles
- background blur orbs use animate-pulse which is expensive

REPLACE the entire :root CSS variables block with:

  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 221 83% 53%;          /* blue-600 #2563eb */
    --primary-foreground: 0 0% 100%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222 47% 11%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: 210 40% 96%;
    --accent-foreground: 222 47% 11%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 221 83% 53%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222 47% 4%;
    --foreground: 210 40% 98%;
    --card: 222 47% 7%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 7%;
    --popover-foreground: 210 40% 98%;
    --primary: 217 91% 60%;          /* blue-500 for dark mode */
    --primary-foreground: 0 0% 100%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 213 94% 68%;
    --radius: 0.5rem;
  }

REMOVE these entire blocks from globals.css (they use !important and break things):
  - The "Premium Form Inputs" block (input, textarea, select override)
  - The "sidebar-glass" block (move to inline Tailwind instead)
  - The "glass-effect" block (replace with Tailwind classes directly)
  
KEEP:
  - @import statements
  - @tailwind directives
  - custom-scrollbar styles
  - shimmer-bg animation
  - keyframe definitions
  - animate-fade-in-up
  - premium-card (but REMOVE the box-shadow override that uses !important)

REPLACE the background blur orbs in src/app/(dashboard)/layout.tsx:
  REMOVE the two animated blur divs:
    <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 ... animate-pulse" />
    <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 ... animate-pulse" />
  
  REPLACE with a single static, non-animated subtle gradient:
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-slate-50/20 
                    dark:from-blue-950/20 dark:via-transparent dark:to-slate-950/10 
                    pointer-events-none" />


══════════════════════════════════════════════
FIX 3 — Typography System
Files: ALL .tsx files in src/
══════════════════════════════════════════════

PROBLEM: font-black (900) is used everywhere including body text,
table cells, descriptions, and badges — destroying visual hierarchy.

Apply these replacements GLOBALLY across all .tsx files:

FIND → REPLACE (all occurrences):
  "font-black text-[10px]"  → "font-semibold text-[11px]"
  "font-black text-xs"      → "font-semibold text-xs"
  "font-black text-sm"      → "font-medium text-sm"
  "font-black uppercase text-[10px] tracking-widest"  → "font-semibold text-[11px] uppercase tracking-wider text-slate-500"
  "font-extrabold"          → "font-bold" (everywhere except main page H1s)

SPECIFIC file fixes:

src/components/shared/sidebar.tsx:
  - NAV item labels: change from font-bold to font-medium
  - User name in footer: keep font-semibold
  - OrgSwitcher area: font-medium
  - "WorkflowOS" logo text: keep font-bold (only this)

src/components/shared/header.tsx:
  - Page title h1: font-bold text-lg (was font-black text-xl) 
  - Subtitle: CHANGE from "EzDoc Ecosystem / WorkflowOS" to show
    current org name + month: use a format like "พ.ค. 2568 · {orgName}"
    Fetch from useOrg() hook and useSearchParams() for month
  - Dropdown menu items: font-medium (was font-bold)

src/components/shared/stat-card.tsx:
  - title p tag: font-medium text-sm text-slate-500 (was font-semibold)
  - value h3: font-bold text-2xl (was font-extrabold)
  - trend badge: font-medium text-xs (was font-bold)
  - subtitle: font-normal text-xs (was font-medium)

src/components/transactions/transaction-list.tsx:
  - TableHead cells: font-medium text-xs text-slate-500 uppercase tracking-wider
    (was font-black uppercase text-[10px] tracking-widest)
  - TableCell description: font-medium text-sm (was font-bold)
  - Amount cells: font-semibold (was font-black)
  - Date cells: font-normal text-slate-500 (was font-bold)


══════════════════════════════════════════════
FIX 4 — Border Radius Standardization
Files: ALL page .tsx and component .tsx files
══════════════════════════════════════════════

PROBLEM: rounded-[2rem], rounded-[2.5rem], rounded-[2.5rem], 
rounded-3xl mixed randomly causing visual inconsistency.

ESTABLISH this system and apply it everywhere:
  Cards:            rounded-xl  (12px)
  Modals/Dialogs:   rounded-2xl (16px)  
  Buttons:          rounded-lg  (8px)
  Input fields:     rounded-lg  (8px)
  Badges/Pills:     rounded-full
  Nav items:        rounded-lg  (8px)
  Dropdown menus:   rounded-xl  (12px)
  Search bars:      rounded-xl  (12px)
  Avatar:           rounded-full (circle) or rounded-lg (square style)
  User footer card in sidebar: rounded-xl

FIND → REPLACE globally:
  "rounded-\[2rem\]"    → "rounded-xl"
  "rounded-\[2.5rem\]"  → "rounded-2xl"  (only for Dialogs/Modals)
  "rounded-\[2.5rem\]"  → "rounded-xl"   (for cards and containers)
  "rounded-3xl"         → "rounded-xl"   (except avatar which stays rounded-full)

Specific: src/app/(dashboard)/transactions/page.tsx:
  - Search/filter container: change rounded-[2rem] to rounded-xl
  - Dialog: rounded-2xl (keep modal slightly rounder)
  - Buttons: rounded-lg


══════════════════════════════════════════════
FIX 5 — Dashboard Layout Compactness
File: src/app/(dashboard)/dashboard/page.tsx
══════════════════════════════════════════════

PROBLEM: Too much space-y-8 makes the page require excessive scrolling.

Changes:
1. Change outer wrapper from space-y-8 to space-y-6
2. Change the grid gap from gap-8 to gap-6
3. Reduce CardContent padding from the default p-6 by adding className="p-5"
   on the main chart card
4. The 4 average cards below the chart: change gap-4 mt-8 pt-8 to gap-3 mt-5 pt-5
5. Stat cards grid: change gap-6 to gap-4
6. Change the inner grid gap between left and right columns from gap-8 to gap-6

For the main layout wrapper in src/app/(dashboard)/layout.tsx:
  Change: <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
  To:     <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">


══════════════════════════════════════════════
FIX 6 — StatCard Color Semantic Fix
File: src/components/shared/stat-card.tsx
══════════════════════════════════════════════

PROBLEM: color="info" uses cyan which is inconsistent with the blue
profit color used in the chart. Also the VAT card style clashes.

Update getColors() function:

  case 'info':  // Used for profit/neutral positive metrics
    return {
      bg: 'bg-blue-50/50 dark:bg-blue-950/15',
      border: 'border-blue-100 dark:border-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    }
  
  Add new case 'neutral':  // For cash balance
    return {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      text: 'text-slate-900 dark:text-white',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    }

In dashboard/page.tsx update the stat card array:
  - กำไรสุทธิ: color="info" (blue) ← keep
  - เงินคงเหลือ: color="neutral" ← change from "primary"
  - รายรับ: color="success" (green) ← keep
  - รายจ่าย: color="destructive" (red) ← keep


══════════════════════════════════════════════
FIX 7 — Replace window.confirm() with AlertDialog
Files: transactions/page.tsx, documents/page.tsx, projects/page.tsx
══════════════════════════════════════════════

PROBLEM: window.confirm() shows English browser dialog. Breaks UX.

For each page, add a confirmation dialog state and AlertDialog component.

In transactions/page.tsx:
  1. Add import: import { AlertDialog, AlertDialogAction, AlertDialogCancel, 
     AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
     AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
     
     (If alert-dialog is not in /components/ui/, run:
      npx shadcn-ui@latest add alert-dialog)
  
  2. Add state:
     const [deletingId, setDeletingId] = useState<string | null>(null)
  
  3. Change handleDelete to just set state:
     const handleDelete = (id: string) => setDeletingId(id)
  
  4. Add confirmDelete function:
     const confirmDelete = async () => {
       if (!deletingId) return
       try {
         const res = await fetch(`/api/transactions/${deletingId}`, { method: 'DELETE' })
         if (res.ok) { toast.success('ลบรายการสำเร็จ'); mutate() }
         else { const err = await res.json(); toast.error(err.error || 'ไม่สามารถลบได้') }
       } catch { toast.error('เกิดข้อผิดพลาด') }
       finally { setDeletingId(null) }
     }
  
  5. Add AlertDialog JSX at bottom of return statement (before closing </motion.div>):
     <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
       <AlertDialogContent className="rounded-2xl">
         <AlertDialogHeader>
           <AlertDialogTitle>ยืนยันการลบรายการ</AlertDialogTitle>
           <AlertDialogDescription>
             คุณแน่ใจหรือไม่? การกระทำนี้ไม่สามารถเลิกทำได้
           </AlertDialogDescription>
         </AlertDialogHeader>
         <AlertDialogFooter>
           <AlertDialogCancel className="rounded-lg">ยกเลิก</AlertDialogCancel>
           <AlertDialogAction onClick={confirmDelete} 
             className="bg-red-600 hover:bg-red-700 rounded-lg">
             ลบรายการ
           </AlertDialogAction>
         </AlertDialogFooter>
       </AlertDialogContent>
     </AlertDialog>

Apply the SAME pattern to documents/page.tsx and projects/page.tsx.


══════════════════════════════════════════════
FIX 8 — Navigation Labels & Constants
Files: src/lib/constants.ts, src/components/shared/sidebar.tsx
══════════════════════════════════════════════

PROBLEM: NAV_ITEMS only has labelTh which combines Thai + English.
Sidebar splits it with .split(' ')[0] which cuts off text randomly.

Update src/lib/constants.ts — add labelShort to NavItem interface:

  export interface NavItem {
    href: string
    labelTh: string     // Full label for header/breadcrumb
    labelShort: string  // Short label for sidebar nav items
    icon: string
  }

  export const NAV_ITEMS: NavItem[] = [
    { href: '/dashboard',    labelTh: 'ภาพรวม',     labelShort: 'ภาพรวม',    icon: 'LayoutDashboard' },
    { href: '/transactions', labelTh: 'รายการเงิน',  labelShort: 'รายการเงิน', icon: 'Receipt' },
    { href: '/projects',     labelTh: 'งาน/โปรเจกต์', labelShort: 'โปรเจกต์',  icon: 'Briefcase' },
    { href: '/documents',    labelTh: 'เอกสาร',      labelShort: 'เอกสาร',    icon: 'FileText' },
    { href: '/reports',      labelTh: 'รายงาน',      labelShort: 'รายงาน',    icon: 'BarChart3' },
    { href: '/settings',     labelTh: 'ตั้งค่า',     labelShort: 'ตั้งค่า',   icon: 'Settings' },
  ]

Update sidebar.tsx:
  Change: item.labelTh.split(' ')[0]
  To:     item.labelShort

Update header.tsx:
  Change: activeItem.labelTh  (in pageTitle)
  To:     activeItem.labelTh  (keep full label for page heading)
  
  Also update subtitle from "EzDoc Ecosystem / WorkflowOS" to:
    const { currentOrg } = useOrg()
    const monthParam = searchParams.get('month') || new Date().toISOString().substring(0,7)
    const [year, month] = monthParam.split('-')
    const thaiMonthShort = ['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
                            'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
    const subtitle = `${thaiMonthShort[parseInt(month)]} ${parseInt(year)+543}${currentOrg ? ` · ${currentOrg.name}` : ''}`


══════════════════════════════════════════════
FIX 9 — PDF Thai Font Registration
File: src/components/documents/document-pdf.tsx
══════════════════════════════════════════════

PROBLEM: Using Helvetica renders Thai characters as □□□□ in the PDF.

SOLUTION — Register Sarabun font from Google Fonts CDN:

At the top of document-pdf.tsx, replace the commented Font.register with:

  import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer'
  
  // Register Sarabun Thai font for PDF rendering
  Font.register({
    family: 'Sarabun',
    fonts: [
      {
        src: 'https://fonts.gstatic.com/s/sarabun/v13/DtVhJx26TKEr37c9YL5rilssECs.ttf',
        fontWeight: 400,
      },
      {
        src: 'https://fonts.gstatic.com/s/sarabun/v13/DtVmJx26TKEr37c9YHZJmnssECsyoc4.ttf',
        fontWeight: 700,
      },
    ],
  })
  
  // Override fallback in styles:
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: 40,
      fontFamily: 'Sarabun',  // ← Change from 'Helvetica' to 'Sarabun'
    },
    // ... rest of styles unchanged, but add fontFamily: 'Sarabun' to:
    // title, companyInfo, sectionTitle, tableHeader, tableRow, 
    // totalsSection, signatureSection — any text element
  })

NOTE: The first PDF generation may be slightly slower due to font download.
For production, host the font file locally in /public/fonts/Sarabun-Regular.ttf
and /public/fonts/Sarabun-Bold.ttf and reference as src: '/fonts/Sarabun-Regular.ttf'


══════════════════════════════════════════════
FIX 10 — Sidebar & Layout Polish
Files: sidebar.tsx, layout.tsx (dashboard)
══════════════════════════════════════════════

PROBLEM: Sidebar has some inconsistencies in collapse behavior and
the user footer card design.

src/components/shared/sidebar.tsx changes:

1. Collapsed toggle button positioning is broken (uses absolute -right-4)
   REPLACE with: always render toggle inside sidebar at bottom of nav,
   not with absolute positioning:
   
   At the bottom of <nav>, add:
   {!isMobile && (
     <button
       onClick={() => setIsCollapsed(!isCollapsed)}
       className="mt-4 w-full flex items-center justify-center h-9 rounded-lg 
                  text-slate-400 hover:text-slate-600 hover:bg-slate-100 
                  dark:hover:bg-slate-800 transition-all"
     >
       {collapsed 
         ? <ChevronRight className="h-4 w-4" /> 
         : <><ChevronLeft className="h-4 w-4" /><span className="ml-2 text-xs font-medium">ย่อเมนู</span></>
       }
     </button>
   )}

2. User footer card: change the dark background approach:
   REPLACE:
     className="bg-slate-900 dark:bg-blue-600 rounded-[2rem] ..."
   WITH:
     className="bg-slate-50 dark:bg-slate-800 border border-slate-200 
                dark:border-slate-700 rounded-xl p-3 flex items-center 
                justify-between gap-3"
   
   This makes it consistent with the overall light UI instead of a 
   jarring dark block at the bottom.

3. Nav item active state — add left border accent instead of full blue fill:
   REPLACE active nav item classes:
     isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
   WITH:
     isActive ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 
                 border-l-2 border-blue-600 rounded-l-none rounded-r-lg font-semibold'
   
   This is a cleaner "enterprise SaaS" pattern vs the solid blue block.

src/app/(dashboard)/layout.tsx:
  REMOVE the two animated blur orb divs (already covered in Fix 2).
  The layout should be:
  
  <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent 
                    to-transparent dark:from-blue-950/10 pointer-events-none" />
    <Sidebar className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
    <div className="flex flex-1 flex-col overflow-hidden relative">
      <Header />
      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {children}
      </main>
    </div>
  </div>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Do NOT change any API routes or data fetching logic
- Do NOT change Prisma schema or database
- Do NOT remove framer-motion animations (except the blur orbs)
- Do NOT change the SWR data fetching pattern
- Do NOT modify the auth flow
- Preserve ALL existing Thai text — only change className attributes
- After each fix, ensure no TypeScript errors are introduced
- Use only classes already in Tailwind (no arbitrary values unless
  truly necessary)
- The AlertDialog must be added to shadcn/ui first if missing:
  npx shadcn-ui@latest add alert-dialog

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CODE QUALITY REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- No new 'any' types introduced
- All new state variables must be typed explicitly
- Keep file-level comment at top of each modified file
- Use cn() utility for all conditional classNames
- Do not use inline style={{}} unless absolutely unavoidable

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION STEPS — Run after completing ALL fixes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. `npm run build` — zero TypeScript errors, zero build errors
2. `npm run lint` — zero ESLint errors
3. `git status` — .env should NOT appear in tracked files
4. Visual checks in browser (npm run dev):
   a. /dashboard — page loads, all 6 sections visible, no excessive spacing
   b. Stat cards — colors: green/red/blue/neutral (not cyan for profit)
   c. Sidebar — nav items show full Thai labels, active state has left border
   d. Sidebar — user footer is light-colored (not dark block)
   e. Header — subtitle shows month + org name (not "EzDoc Ecosystem")
   f. /transactions — delete button triggers Thai AlertDialog (not browser confirm)
   g. /documents — delete button triggers Thai AlertDialog
   h. Typography — no body text using font-black, hierarchy is visible
   i. All cards use rounded-xl consistently
   j. Form inputs — focus ring works (blue glow, not broken)
5. Dark mode check: toggle to dark mode, verify all text is readable
6. Mobile check (375px): sidebar collapses, hamburger appears, content readable
7. Create a test document → Download PDF → verify Thai text renders (not □□□)
```

---

## 📋 Quick Reference: What Changed Where

| File | Changes |
|------|---------|
| `.gitignore` | Added `.env` to ignore list |
| `globals.css` | Blue primary tokens, removed !important overrides |
| `(dashboard)/layout.tsx` | Removed animated blur orbs, fixed padding p-8→p-6 |
| `sidebar.tsx` | Nav labels, active state, user footer, collapse button |
| `header.tsx` | Subtitle shows month+org, font weights |
| `stat-card.tsx` | Fixed "info" color to blue, added "neutral" variant |
| `dashboard/page.tsx` | Reduced spacing, fixed stat card colors |
| `constants.ts` | Added `labelShort` to NavItem |
| `transaction-list.tsx` | Typography weights, table header styles |
| `transactions/page.tsx` | AlertDialog for delete, border radius |
| `documents/page.tsx` | AlertDialog for delete |
| `projects/page.tsx` | AlertDialog for delete |
| `document-pdf.tsx` | Sarabun font registration |

## ⚠️ After This Prompt Completes

Remind user to:
1. Rotate `OPENAI_API_KEY` at platform.openai.com
2. Rotate `DATABASE_URL` at Supabase → Settings → Database
3. Check that `.env` is not shown in `git status`
4. Test PDF download with Thai characters before deploying
