# Building TCN_BandOffice, TCN_E_T, TCN_Health in HTMX + Go

All three pages (`src/app/TCN_BandOffice/page.tsx`, `src/app/TCN_E_T/page.tsx`, `src/app/TCN_Health/page.tsx`) share **one identical shell**: a fixed top bar, a 4-tab layout (pill buttons on mobile, a left sidebar on desktop), and a fixed mobile bottom nav. Only the tab labels/icons and the tab body content differ between the three.

**`TCN_BandOffice` is the primary reference** — it's the only one of the three with real tab content built out (council roster, bulletins, governance, directory). `TCN_E_T` and `TCN_Health` currently render the exact same shell with placeholder text in each tab (`"... content goes here"`) — they're scaffolded but not built yet, so port the shell once and treat their tab bodies as TODO stubs.

Cross-reference: color tokens, fluid type classes, `.genbkg`, and `UserSessionBar` are documented in `frontend-style-guide.md`; the mobile bottom nav and page-header banner are shared with `TCN_Home` — see `tcn-home-page-build-guide.md §1, §7` for those, only repeated here where this page's usage differs.

---

## 0. Shared page skeleton (all three pages)

```
<body>
└── div.genbkg (full-page background, min-height: 100vh)
    ├── Fixed top bar (UserSessionBar)
    ├── Content wrapper (max-width 7xl, centered, padding-top to clear fixed bar)
    │   ├── Mobile tab-switcher (sticky pill-button row, 4 buttons, 2x2 grid) — hidden ≥lg
    │   └── Two-column layout (grid-cols-6 on desktop)
    │       ├── Desktop sidebar tab list (col 1 of 6) — hidden <lg
    │       └── Active tab's content panel (col 2-6 / col span 5)
    └── Fixed bottom nav (mobile only, 5 icons) — hidden ≥lg
```

Root + wrapper:
```html
<div class="genbkg" style="width:100%; min-height:100vh;">
  <div style="position:fixed; top:0; z-index:50; width:100%;" class="shadow-md">
    {{ template "user-session-bar" . }}
  </div>
  <div class="bo-content">
    ...
  </div>
  <nav class="mobile-bottom-nav lg:hidden">...</nav>
</div>
```
```css
.bo-content { padding-top: 4rem; padding-bottom: 5rem; }
@media (min-width: 1024px) { .bo-content { padding-bottom: 1.5rem; } }
.bo-container { max-width: 80rem; margin-inline: auto; padding: 1rem 0.75rem; }
@media (min-width: 640px) { .bo-container { padding-top: 1.5rem; padding-bottom: 1.5rem; padding-left: 1rem; padding-right: 1rem; } }
```
Note this is `max-w-7xl` (1280px), **not** `max-w-5xl` like TCN_Links, and it does not switch to a percentage-based width at any breakpoint — it's a flat max-width the whole way up.

---

## 1. Tab state model

There is no routing or URL param involved — tab switching is pure client state (`useState`, one of `"tab1"`..`"tab4"`), so nothing in the URL changes when you switch tabs and a page refresh always resets to tab1. For the Go/HTMX port, the simplest equivalent is either:
- **Pure client-side**: 4 hidden `<div>` panels, toggle `hidden` via a few lines of vanilla JS/Alpine on button click (no server round-trip) — closest match to current behavior.
- **HTMX swap**: each tab button does `hx-get="/TCN_BandOffice/tab/{{n}}" hx-target="#tab-panel"` and the server returns just that panel's markup — better if tab content ends up being expensive/DB-backed (it is, for BandOffice — see §5), since you can lazy-load only the active tab instead of fetching all 4 up front.

Either way, both the mobile pill row and the desktop sidebar must drive the **same** active-tab state (they're two views of one selector, not independent).

---

## 2. Mobile tab-switcher (sticky pill row, hidden ≥lg)

```html
<div class="bo-mobile-tabs lg:hidden">
  <div class="bo-mobile-tabs-grid">
    <button type="button" class="bo-pill" data-tab="tab1" data-active="true">
      <svg><!-- icon --></svg> Council
    </button>
    <button type="button" class="bo-pill" data-tab="tab2">
      <svg><!-- Bell icon --></svg> Bulletins
    </button>
    <button type="button" class="bo-pill" data-tab="tab3">
      <svg><!-- icon --></svg> Governance
    </button>
    <button type="button" class="bo-pill" data-tab="tab4">
      <svg><!-- Users icon --></svg> Directory
    </button>
  </div>
</div>
```
```css
.bo-mobile-tabs {
  position: sticky;
  top: 4rem; /* clears the 64px fixed header */
  z-index: 40;
  margin: 0 -0.75rem 1rem;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(4px);
  border-bottom: 1px solid #e7e5e4; /* stone-200 */
}
@media (min-width: 640px) { .bo-mobile-tabs { margin-inline: -1rem; } }
.bo-mobile-tabs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding: 0.75rem;
}
.bo-pill {
  display: flex; align-items: center; justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid #e7e5e4; /* stone-200 */
  color: #57534e; /* stone-600 */
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}
.bo-pill:hover { color: #b45309; border-color: #fcd34d; } /* amber-700 / amber-300 */
.bo-pill[data-active="true"] {
  background: #b45309; /* amber-700 */
  color: white;
  border-color: #b45309;
}
.bo-pill svg { width: 1rem; height: 1rem; }
```
The 4 buttons sit `-mx-3`/`-mx-4` (bleeding to the container edge), so the sticky bar spans full width even though the page content has side padding.

---

## 3. Desktop sidebar tab list (col-span-1 of 6, hidden <lg)

```html
<div class="hidden lg:block bo-sidebar">
  <div class="bo-sidebar-list">
    <div class="bo-sidebar-item" data-tab="tab1" data-active="true">
      <svg><!-- icon --></svg>
      <span>Council</span>
    </div>
    <div class="bo-sidebar-item" data-tab="tab2">
      <svg><!-- Bell icon --></svg>
      <span>Bulletins</span>
    </div>
    <div class="bo-sidebar-item" data-tab="tab3">
      <svg><!-- icon --></svg>
      <span>Governance</span>
    </div>
    <div class="bo-sidebar-item" data-tab="tab4">
      <svg><!-- Users icon --></svg>
      <span>Directory</span>
    </div>
  </div>
</div>
```
```css
.bo-sidebar-list {
  display: flex; flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem;
}
.bo-sidebar-item {
  width: 100%;
  border-radius: 1rem; /* rounded-2xl */
  background: rgba(120, 53, 15, 0.95); /* amber-900/95 */
  backdrop-filter: blur(4px);
  border: 1px solid rgba(217, 119, 6, 0.5); /* amber-600/50 */
  display: flex; align-items: center; gap: 0.75rem;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}
.bo-sidebar-item:hover { background: #92400e; } /* amber-800 */
.bo-sidebar-item svg { width: 1.5rem; height: 1.5rem; color: #fffbeb; flex-shrink: 0; } /* amber-50 */
.bo-sidebar-item span { font-size: 1.125rem; font-weight: 600; color: #fffbeb; }
.bo-sidebar-item[data-active="true"] {
  background: rgba(120, 53, 15, 0.5); /* amber-900/50 */
  box-shadow: 0 0 0 2px #fbbf24; /* ring-2 ring-amber-400 */
}
.bo-sidebar-item[data-active="true"] svg,
.bo-sidebar-item[data-active="true"] span { color: #262626; } /* neutral-800 */
```
Wrapping grid (mobile-tabs + sidebar + content panel all live inside this):
```css
.bo-layout { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 1024px) { .bo-layout { grid-template-columns: repeat(6, 1fr); } }
.bo-sidebar { grid-column: span 1; }
.bo-panel { grid-column: span 1; }
@media (min-width: 1024px) { .bo-panel { grid-column: span 5; } }
```

Icons per tab, all `lucide-react`: `Building2` (Council/tab1 across all 3 pages), `Bell` (tab2), `Briefcase` (tab3), `Users` (tab4) — swap for inline SVGs same as other pages. Note the icon choice doesn't change meaning per-page (e.g. `Briefcase` labels "Governance" on BandOffice but "On Going Jobs" on E_T) — it's the same 4 icons reused with different labels on every page, not icons chosen to match each label's semantics.

---

## 4. Tab content transition (optional, nice-to-have)

Each panel fades/slides in on activation: `opacity 0→1`, `y: 8→0`, `0.2s`. CSS equivalent:
```css
.bo-tab-panel { opacity: 0; transform: translateY(8px); transition: opacity 0.2s ease, transform 0.2s ease; }
.bo-tab-panel[data-active="true"] { opacity: 1; transform: translateY(0); }
```

---

## 5. Fixed mobile bottom nav

Identical component/markup to the one on `TCN_Home` — same 5 links, same active-state logic (compare current path). See `tcn-home-page-build-guide.md §7` for full CSS; the only page-specific note is that on **all three of these pages**, the "Directory" bottom-nav icon (`Briefcase`) links to `/TCN_BandOffice` itself (the whole page, defaulting to tab1 "Council"), not to the Directory tab specifically — so arriving via that nav icon lands on Council, and the user has to tap the Directory tab manually. Worth deciding in the Go port whether to fix that (e.g. link to `/TCN_BandOffice?tab=tab4` or `#tab4` if you add tab-state URL sync) or keep matching the current (slightly confusing) behavior.

Also note: all three page files import `MobilePageHeader` from the shared nav component but never render it directly in the page shell itself — same dead-import pattern seen in `TCN_Links`. It IS rendered, just one level down, inside two of BandOffice's own tab-content components (see §7.1 and §7.3) — so don't skip it entirely, just don't expect to find it wired into the page shell.

---

## 6. Per-page tab configuration

The shell is byte-for-byte identical across all three pages except for these labels/content. Build one shared template/partial and pass this table in as page config:

| Page | tab1 label | tab2 label | tab3 label | tab4 label |
|---|---|---|---|---|
| TCN_BandOffice | Council | Bulletins | Governance | Directory |
| TCN_E_T | Jobs | ISET | On Going Jobs | T.E.A |
| TCN_Health | NIHB | Health Service 1 | Health Service 2 | Health Service 3 |

Icons (same 4, same order, on every page): `Building2`, `Bell`, `Briefcase`, `Users`.

---

## 7. TCN_BandOffice tab content (primary reference — real, built-out content)

### 7.1 Tab 1 — Council

Data: a real server-backed query equivalent to `getChiefAndCouncil()`, returning:
```go
type Council struct {
    ID           string
    CouncilStart string // date
    CouncilEnd   string // date
}
type CouncilMember struct {
    ID         string
    Position   string // "CHIEF" | "COUNCILLOR"
    FirstName  string
    LastName   string
    Portfolios []string // up to 4, currently not rendered in UI — carry the field but no need to build UI for it yet
    Email      string
    Phone      string
    Bio        string // optional
    ImageURL   string // optional
}
```
Layout, top to bottom:
1. Gradient header card (`from-blue-700 to-blue-900`, `rounded-2xl`) — plain title banner, no page-header component involved here (this is a locally-styled div, distinct from `MobilePageHeader`).
2. Council term banner: `bg-amber-50 border border-amber-200 rounded-xl`, shows `{CouncilStart}–{CouncilEnd}` formatted as month/year (e.g. "Jan 2023 – Dec 2027").
3. Chief section: single `CouncilMemberCard` rendered with a "chief" variant (bigger emphasis / crown icon).
4. Councillors section: list of `CouncilMemberCard`s, each fading in staggered by `index * 0.05s` if you keep the entrance animation.

**`CouncilMemberCard`** — collapsed row, click-to-expand (no animation library needed, just toggle a `hidden`/max-height class):
```html
<div class="council-card">
  <button type="button" class="council-card-header" data-expanded="false">
    <div class="council-card-avatar">
      {{ if .ImageURL }}<img src="{{.ImageURL}}" alt="{{.FirstName}} {{.LastName}}" />
      {{ else }}<svg><!-- Crown icon if Chief, else User icon --></svg>{{ end }}
    </div>
    <div class="council-card-name">
      <p>{{.FirstName}} {{.LastName}}</p>
      <span>{{.Position}}</span>
    </div>
    <svg class="council-card-chevron"><!-- ChevronDown, flips to ChevronUp when expanded --></svg>
  </button>
  <div class="council-card-body" hidden>
    <p>{{.Bio}}</p>
    <a href="mailto:{{.Email}}"><svg><!-- Mail icon --></svg>{{.Email}}</a>
    <a href="tel:{{.Phone}}"><svg><!-- Phone icon --></svg>{{.Phone}}</a>
  </div>
</div>
```
```css
.council-card-avatar { width: 4rem; height: 4rem; border-radius: 9999px; overflow: hidden; background: #fef3c7; display:flex; align-items:center; justify-content:center; }
```
States: loading = amber spinner + text; empty = `Users` icon + "No council members found."

**Do not port**: this file (`chief_council.tsx`) also fetches bulletins for a modal and defines a hardcoded `communityByLaws` array, but neither is actually rendered anywhere in this tab — both are dead code left over from an earlier version. Skip them; the real bylaws/news views live in the Governance tab instead (§7.3).

### 7.2 Tab 2 — Bulletins

Data: paginated bulletin query filtered to `category: "CHIEF_COUNCIL"`, sorted newest-first:
```go
type Bulletin struct {
    ID       string
    Title    string
    Subject  string
    Content  string // HTML
    PosterURL string // optional — image-based bulletin instead of text
    Category string
    Created  string
    Updated  string
}
```
Layout:
1. Gradient header (`from-amber-700 to-amber-900`).
2. **Featured post**: the single newest bulletin, large card, "Latest" badge, title, `Subject` clamped to 3 lines, "Read Full Post →" link.
3. **Recent posts grid**: `grid-cols-1 sm:grid-cols-2`, remaining bulletins as smaller cards — title/subject clamped to 2 lines, small colored dot + category label, date, "View →".

Interactivity: clicking any card opens a modal showing either the poster image (if `PosterURL` set) or the bulletin's `Content` HTML. Modal closes on backdrop click or an `X` button. For the Go port, this is a good candidate for an HTMX modal: `hx-get="/api/bulletin/{{.ID}}" hx-target="#modal-root"` returning the modal partial, rather than shipping all bulletin bodies to the client up front.

Poster image URLs are rewritten client-side from a stored absolute/relative URL to `/api/poster/{filename}` — replicate as a Go route that serves/proxies the stored poster file by filename.

Sanitization note: bulletin `Content` is rendered as raw HTML (`dangerouslySetInnerHTML` in React, after stripping inline `style=` attributes and `&nbsp;`). **In the Go port, sanitize server-side** (e.g. `bluemonday`) before writing bulletin HTML into the response — don't just trust stored content is safe to emit verbatim.

### 7.3 Tab 3 — Governance

This is the more complete implementation — treat it as canonical for anything council/bylaws/news-related, since tab1's version of the same council list is a duplicate/earlier pass. It has its own internal 3-way sub-tab: **Council / Bylaws / News**, switched via 3 buttons (icons `Crown` / `Scale` / `Megaphone`), active styled `bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-md`. A `MobilePageHeader` banner is rendered at the top of this tab specifically (gradient default `from-amber-700 to-amber-900`, title/subtitle/icon props) — this is one of the two places `MobilePageHeader` actually gets used (see §5).

Note a real UX gap in the source worth flagging rather than silently "fixing" without asking: the 3 sub-tab buttons only render in the mobile layout — there's no visible desktop control for switching between Council/Bylaws/News sub-views, even though the same `activeTab` state governs both. Decide whether to add a desktop sub-tab row when porting, or preserve the gap.

- **Council pane**: identical data/card layout to §7.1 (same `getChiefAndCouncil()` query, same `CouncilMemberCard`).
- **Bylaws pane**: renders a hardcoded list (2 items currently):
  ```go
  type ByLaw struct {
      ID            string
      Title         string
      Description   string
      PDFURL        string
      EffectiveDate string
      Category      string
  }
  ```
  Sample data: `{Title: "Community Protection By-Law", Category: "Safety", ...}`, `{Title: "Intoxicant By-Law", Category: "Safety", ...}`.
  Each `ByLawCard`: flex row — category badge (`bg-blue-100 text-blue-800`) + effective date, title, description clamped to 2 lines, two actions: "View" (`Eye` icon, opens `PDFURL` in a new tab) and "Download" (`Download` icon, `download` attribute).
- **News pane**: same bulletin query as §7.2 but flat list layout (no featured/grid split) — blue dot + "Chief & Council" label + date, title, subject clamped to 2 lines, "View Details →", opening the same image/text modal pattern.

### 7.4 Tab 4 — Directory

Currently a stub — no data, no cards:
```html
<div>
  <div class="council-heading">Directory</div>
  <p>Welcome to the Band Office! Here you can find the Band office directory.</p>
</div>
```
Nothing structural to port here; flag it as needing real design/content when you get to it, same status as the placeholder tabs on E_T/Health below.

---

## 8. TCN_E_T and TCN_Health tab content (currently placeholders)

Both pages use the exact shell from §0–§5 with these labels (§6) and, for every tab, only a single line of plain text — no cards, no data fetch, no components:

- TCN_E_T: "Employment Bulletins go here" / "ISET content goes here" / "On Going Jobs content goes here" / "T.E.A (Tataskweyak Education Authority) content goes here"
- TCN_Health: "NIHB content goes here." / "Health Service 1 content goes here." / "Health Service 2 content goes here." / "Health Service 3 content goes here."

Port the shell now; treat each tab body as a TODO placeholder `<p>` until real content/design is specified for these two pages — there's nothing else in the source to reverse-engineer for them yet.

---

## 9. Notes on dead/unused code in the source

- All three pages import `MobilePageHeader` at the page level and never render it there (§5) — don't build a page-level header from this import; the real usage is inside `chief_council.tsx` and `governance.tsx` (§7.1, §7.3), and only on BandOffice.
- All three pages import `Sheet`/`SheetContent`/`SheetHeader`/`SheetTitle`/`SheetTrigger` and a long list of extra lucide icons (`Heart`, `GraduationCap`, `MapPin`, `ArrowLeft`, `Shield`, `Dumbbell`, `Hotel`, `Baby`, `Search`, `Filter`, etc.) that are never used anywhere in these files — leftover imports, safe to ignore entirely when porting.
- `chief_council.tsx` fetches bulletins and defines a `communityByLaws` array that are never rendered (§7.1) — the file is effectively a superseded draft of `governance.tsx`'s council section, still wired into BandOffice tab1 even though tab3 has the more complete implementation of the same list plus bylaws/news besides.
- `bo_directory.tsx` (tab4) is a one-paragraph stub (§7.4).
- Bulletin `Content` HTML is rendered client-side without server-side sanitization in the current React app — carry that risk in mind and sanitize on the Go side rather than reproducing it as-is (§7.2).
