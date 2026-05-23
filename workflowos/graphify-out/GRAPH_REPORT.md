# Graph Report - working/EzDoc/workflowos  (2026-05-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 462 nodes · 1047 edges · 30 communities (26 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3a81ec97`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 24|Community 24]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 110 edges
2. `OrgSwitcher()` - 25 edges
3. `Button` - 21 edges
4. `useOrg()` - 19 edges
5. `DropdownMenu()` - 18 edges
6. `createClient()` - 18 edges
7. `compilerOptions` - 15 edges
8. `Card()` - 15 edges
9. `InputGroup()` - 14 edges
10. `useAuth()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  src/lib/utils.ts → package.json
- `"ai_insights"` --references--> `Organization`  [EXTRACTED]
  prisma/migrations/20260522120436_init/migration.sql → src/types/org.ts
- `DocumentsPage()` --references--> `"users"`  [EXTRACTED]
  src/app/(dashboard)/documents/page.tsx → prisma/migrations/20260522120436_init/migration.sql
- `"org_members"` --references--> `Organization`  [EXTRACTED]
  prisma/migrations/20260522120436_init/migration.sql → src/types/org.ts
- `"contacts"` --references--> `Organization`  [EXTRACTED]
  prisma/migrations/20260522120436_init/migration.sql → src/types/org.ts

## Communities (30 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (43): DashboardContent(), DashboardData, formatBaht(), TrendChart, TooltipPayloadEntry, TrendItem, useOrg(), arabicToThaiBahtText() (+35 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (35): Area, CompanyFormData, companySchema, ProjectForm(), ProjectFormData, ProjectFormProps, projectSchema, Area (+27 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (7): DELETE(), GET(), DELETE(), GET(), createClient(), getSupabaseAnonKey(), getSupabaseUrl()

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (25): metadata, sarabun, OnboardingContent(), AuthProvider(), AuthState, useAuthStore, OrgState, useOrgStore (+17 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (32): "ai_insights", "categories", "contacts", "org_members", "projects", "tasks", "users", DocumentsPage() (+24 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (32): dependencies, axios, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, framer-motion (+24 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.19
Nodes (16): cn(), Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList() (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (14): DOCUMENT_TYPES, NAV_ITEMS, NavItem, PAYMENT_STATUS, PROJECT_STATUS, TRANSACTION_TYPES, IconMap, SidebarProps (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "Community 10"
Cohesion: 0.20
Nodes (12): getThaiMonths(), MonthSelector(), DropdownMenuContent(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton() (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (8): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent(), DropdownMenuSubTrigger(), DropdownMenuTrigger()

### Community 12 - "Community 12"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, eslint-config-prettier, postcss, prettier, prettier-plugin-tailwindcss, tailwindcss (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (8): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), SheetTrigger()

### Community 14 - "Community 14"
Cohesion: 0.32
Nodes (6): RegisterFormValues, RegisterPage(), registerSchema, buttonVariants, Calendar(), CalendarDayButton()

### Community 15 - "Community 15"
Cohesion: 0.53
Nodes (4): config, getSupabaseAnonKey(), getSupabaseUrl(), updateSession()

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (5): extends, rules, react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars

### Community 17 - "Community 17"
Cohesion: 0.33
Nodes (5): name, prisma, seed, private, version

### Community 18 - "Community 18"
Cohesion: 0.40
Nodes (5): useAuth(), LoginPage(), SettingsPage(), Header(), Sidebar()

### Community 19 - "Community 19"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

## Knowledge Gaps
- **149 isolated node(s):** `extends`, `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-unused-vars`, `react-hooks/exhaustive-deps`, `prisma` (+144 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 7` to `Community 0`, `Community 1`, `Community 4`, `Community 5`, `Community 8`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 18`?**
  _High betweenness centrality (0.222) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 5` to `Community 17`, `Community 3`, `Community 20`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **Why does `clsx` connect `Community 5` to `Community 7`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **What connects `extends`, `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-unused-vars` to the rest of the system?**
  _149 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08408249603384453 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09579100145137881 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06259426847662142 - nodes in this community are weakly interconnected._