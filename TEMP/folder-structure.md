# TCN Members — Folder & File Structure

Reference for understanding how this Next.js app is organized, for use when planning the equivalent layout in the HTMX + Go rebuild.

Framework note: this is a Next.js **App Router** project — every folder under `src/app/` is a route, and a folder becomes a URL segment automatically (no central route table). `page.tsx` renders that segment; `layout.tsx` wraps it and everything nested below it; `route.ts` under `api/` is a server endpoint instead of a page. Keep that in mind whenever a section below says "this folder = this URL."

---

## 1. Top-level layout

```
tcn_members/
├── src/                  # all application source (see §2)
├── prisma/               # database schema (Prisma ORM) + migration SQL
├── public/               # static assets served as-is (images, logos, favicon)
├── scripts/              # one-off/maintenance Node scripts (data import, etc.)
├── barcodes/             # generated member barcode images (jpg), by member ID
├── TEMP/                 # scratch folder for working files (this guide, CSV exports) — not part of the shipped app
├── AGENTS.md / CLAUDE.md # coding-agent instructions for this repo
├── next.config.ts        # Next.js build config
├── postcss.config.mjs    # Tailwind v4 / PostCSS pipeline
├── prisma.config.ts      # Prisma CLI config
├── components.json        # shadcn/ui component generator config
├── package.json / package-lock.json
└── tsconfig.json
```

**Note:** three stray files at the repo root — `erult = subprocess.run(`, `ubprocess, os`, `ult.stdout)` — look like a corrupted/truncated Python heredoc that got written out as filenames rather than executed (dated back to June, not tracked in git status). They're not referenced by the app; worth deleting whenever it's convenient, but I left them alone since you didn't ask me to touch them.

---

## 2. `src/` breakdown

```
src/
├── app/            # routes + API endpoints (App Router) — see §3
├── components/     # shared React components used across member-facing pages
├── contexts/       # React context providers (member-side auth context)
├── data/           # static JSON data bundled into the app (e.g. video lists)
├── hooks/          # shared React hooks (media query, member data, webauthn, password reset)
├── lib/            # server actions, auth config, validation, email, business logic
└── types/          # ambient TypeScript type augmentation (next-auth session shape)
```

`src/lib/` is the "backend logic" layer for the member-facing side — things like `auth.ts` (NextAuth config), `actions.ts`/`client-actions.ts` (server actions), `security.ts`, `rate-limit.ts`, `validation.ts`, `email.ts`, `sync-validation.ts`, `payPeriod.ts`, `travelFormCalculations.ts`. This is the closest analog to a Go `internal/` or `services/` package in the rebuild.

---

## 3. `src/app/` — public member-facing routes

Each top-level folder is a page reachable at `/<FolderName>`:

| Route folder | URL | Purpose |
|---|---|---|
| `page.tsx` (root) | `/` | Landing page |
| `Achimowin_Intro/` | `/Achimowin_Intro` | Unauthenticated "how it works" explainer (see style guide doc) |
| `TCN_Enter/` | `/TCN_Enter` | Entry/login gateway for members |
| `Account_Activate/` | `/Account_Activate` | Treaty number + birthdate account activation flow |
| `forgot-password/`, `reset-password/` | — | Credential recovery flow |
| `Member_Account/` (+ `edit/`) | `/Member_Account` | Logged-in member's own profile, view & edit |
| `TCN_Home/` | `/TCN_Home` | Member portal home/dashboard |
| `TCN_BandOffice/` | `/TCN_BandOffice` | Band office services info |
| `TCN_BulletinBoard/` | `/TCN_BulletinBoard` | Community announcements |
| `TCN_Contacts/` | `/TCN_Contacts` | Directory/contacts |
| `TCN_E_T/` | `/TCN_E_T` | Education & Training section |
| `TCN_Forms/` | `/TCN_Forms` | Member-facing form submissions |
| `TCN_Health/` | `/TCN_Health` | Health services info |
| `TCN_Links/` | `/TCN_Links` | External resource links |
| `TCN_LocalServices/` | `/TCN_LocalServices` | Local services directory |
| `TCN_Matters/` | `/TCN_Matters` | News / governance matters + video content |
| `TCN_Stats/` | `/TCN_Stats` | Community statistics widget |
| `TCN_TRSC/` | `/TCN_TRSC` | TRSC program section |
| `TCN_Technology/` | `/TCN_Technology` | Tech/system overview (sibling of Achimowin_Intro) |
| `TCN_Youth_Comm/` | `/TCN_Youth_Comm` | Youth committee section |
| `TCN_Achimowin/` | `/TCN_Achimowin` | Currently a near-empty stub page (in progress) |
| `api/` | `/api/*` | Server endpoints, see §4 |
| `Fq6pm72NjqUA/` | `/Fq6pm72NjqUA/*` | **Staff/admin portal — see §5** |

Two routes present in the working tree as deletions (per git status) — `TCN_LocalGovernance/` and `TCN_TownHall/` — appear to have been removed/renamed during the recent UI rebuild.

---

## 4. `src/app/api/` — backend endpoints

Grouped by domain, each a `route.ts` (or `[param]/route.ts` for dynamic segments) handling HTTP verbs directly — this is the most direct analog to individual Go HTTP handlers:

| Group | Handles |
|---|---|
| `auth/` (+ `[...nextauth]`) | NextAuth session handling, password reset, credential recovery |
| `member/` | Member CRUD: profile fetch, account/address/contact updates, photo upload |
| `barcode/` | Barcode image generation/download, and scan-session handling |
| `register/`, `complete-activation/` | New member registration + activation completion |
| `comm/` | Staff-side communications: bulletin, email, SMS, contacts, dashboards, users, logs, activation support, signup forms — this is the API surface behind the `Fq6pm72NjqUA` staff app |
| `signup-forms/` | Public-facing dynamic form submissions |
| `memos/`, `timesheets/`, `travel-forms/` | Staff HR-adjacent records (memos, timesheets, travel claims + rates/stats) |
| `poster/` | Bulletin poster image serving |
| `sync/` | Data sync endpoints (batch, members, contacts, bulletin, council, poster, pull, status) — likely the bridge to an external system of record |
| `v1/governance/` | Versioned governance data API |
| `test-db/` | DB connectivity check (dev/debug) |

---

## 5. `src/app/Fq6pm72NjqUA/` — the staff/admin portal

**`Fq6pm72NjqUA` is a deliberately random, meaningless string of characters used as the URL segment for the entire internal staff application** (`/Fq6pm72NjqUA/login`, `/Fq6pm72NjqUA/admin`, `/Fq6pm72NjqUA/dashboard`, etc.), instead of an obvious name like `/staff`, `/admin`, or `/internal`.

**Why:** it's "security by obscurity" as a *supplementary* layer, not a replacement for real access control — the goal is to make the staff login page harder to stumble onto or guess by casual URL-guessing, automated scanners, or search-engine crawling, since the real gate is still role-based authentication underneath it (see `StaffAuthContext.tsx`, which checks `role` against `ADMIN`, `STAFF_ADMIN`, `FINANCE`, `DEPARTMENT_ADMIN`, `COUNCIL`, etc. and redirects unauthenticated/unauthorized users regardless of which URL they hit). Every request into this subtree still goes through the same NextAuth/session checks as the rest of the app — the random path just keeps it off the beaten path for anyone poking around the public site.

**Recreating this in the Go/HTMX app:** mount the staff app under an equally unguessable path prefix (generate your own random string — don't reuse `Fq6pm72NjqUA` verbatim since it's now public in this repo's history) and still enforce full server-side session/role checks on every handler under that prefix. The random path is a nice-to-have that reduces noise/scanning; it must never be the only thing standing between the internet and staff data.

### Internal structure (mirrors a full mini-app):

```
Fq6pm72NjqUA/
├── layout.tsx              # staff app shell (wraps everything below)
├── page.tsx                # staff portal root — likely a role-based redirect
├── staff-globals.css       # staff-app-specific styling (separate from member CSS)
├── login/page.tsx          # staff login form
├── contexts/StaffAuthContext.tsx   # staff auth/role state, role→dashboard-path routing
├── hooks/useDebounce.ts
├── lib/{api.ts,helpContent.ts,utils.ts}
├── components/              # staff-only UI: Sidebar, TopHeader, HelpDrawer/Tooltip,
│                             #   MemberSearch, communications form builders
├── dashboard/               # general staff dashboard: communications, forms, memos,
│                             #   timesheets, travel (incl. new/[id] sub-routes)
├── admin/                   # elevated admin dashboard: bulletin-manager, communications,
│                             #   forms, memos, staff management, timesheets, travel
├── staff-admin/             # STAFF_ADMIN-role landing area
├── dept-admin/              # DEPARTMENT_ADMIN-role landing area
├── finance/                 # FINANCE-role landing area
└── TCN_Staff_Bulletin/      # staff bulletin view (own layout)
```

Role → landing page mapping (from `getRoleDashboardPath`):
- `ADMIN` / `COUNCIL` → `/Fq6pm72NjqUA/admin`
- `STAFF_ADMIN` → `/Fq6pm72NjqUA/staff-admin`
- `FINANCE` → `/Fq6pm72NjqUA/finance`
- `DEPARTMENT_ADMIN` → `/Fq6pm72NjqUA/dept-admin`
- default/other staff → `/Fq6pm72NjqUA/dashboard`
- a bulletin-only account type → `/Fq6pm72NjqUA/TCN_Staff_Bulletin`

---

## 6. Other top-level folders

- **`prisma/schema.prisma`** — single source of truth for the database schema (Prisma ORM). `migrate-enums.sql` is a hand-written migration for enum changes Prisma's own migration engine didn't cover cleanly.
- **`public/`** — every image/logo/background used by the pages in §3 (see the style guide doc's asset table), plus subfolders `bulletinboard/`, `logos/`, `tcnpdfs/` for grouped assets.
- **`barcodes/jpg/`** — pre-generated barcode images per member ID (`TCNMEM#####.jpg`), served by the `api/barcode/` endpoints rather than generated on the fly.
- **`scripts/`** — standalone Node scripts for data tasks (e.g. bulk-importing the CSVs seen in `TEMP/`), run manually via `node`/`ts-node`, not part of the running app.

---

## 7. Rebuild mapping (Go + HTMX)

| Next.js concept | Go/HTMX equivalent |
|---|---|
| `app/<Folder>/page.tsx` (route by folder) | An HTTP route registered explicitly (e.g. `router.Get("/TCN_Home", ...)`) rendering a Go template |
| `app/<Folder>/layout.tsx` (nested wrapper) | A base template with `{{block "content"}}` / partial includes |
| `app/api/**/route.ts` | Go HTTP handlers grouped by domain package (`internal/handlers/member`, `.../comm`, `.../sync`, etc.) |
| `src/lib/auth.ts` + NextAuth | Your own session/cookie middleware + role check, applied per-route-group |
| `src/lib/*Validation.ts` | Go validation functions/structs per domain |
| `Fq6pm72NjqUA/` obscured prefix | Same idea: mount staff routes under a random path prefix, gated by the same middleware as everything else — never gated by the path alone |
| `public/` | Go's static file server (`http.FileServer`) pointed at an `assets/` or `static/` folder |
| `prisma/schema.prisma` | Your Go ORM's schema/migrations (or raw SQL migrations) |
