# Building TCN_Home in HTMX + Go

A section-by-section spec for recreating `/TCN_Home` (`src/app/TCN_Home/page.tsx`) as a server-rendered Go template. Since your Go backend already has the data/session logic working, this focuses purely on markup structure, CSS, and responsive behavior — everything here is framework-agnostic and can be dropped into a `.html`/`.tmpl` file almost verbatim.

Cross-reference: color tokens, fluid type classes (`apptext*`), and the base `.genbkg` background pattern are documented in `frontend-style-guide.md` — this doc only repeats what's specific to this page.

---

## 0. Page skeleton

```
<body> (bg-background, text-foreground — from globals.css base layer)
└── div.genbkg (full-page background image, min-height: 100vh)
    ├── Fixed top bar (UserSessionBar)
    ├── Main content wrapper (padding-top to clear fixed bar, padding-bottom to clear mobile nav)
    │   ├── Mobile-only "quick link" panel row (3 tiles) — hidden ≥1024px
    │   ├── Hero "Achimowin greet" panel
    │   └── Bento tile grid (9 image tiles + 1 full-width banner)
    └── Fixed bottom nav (mobile only, 5 icons) — hidden ≥1024px
```

Root container:
```html
<div class="genbkg" style="width:100%; min-height:100vh;">
```
`.genbkg` (already defined, reuse from the shared stylesheet):
```css
.genbkg {
  background-image: url("/regbkg.jpg");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}
```

---

## 1. Fixed top navigation

Same `UserSessionBar` component used everywhere else in the authenticated app — see `frontend-style-guide.md §4`. Fixed to the top, full width, `z-index: 150` (above everything else on this page including the hero), drop shadow:

```html
<div style="position:fixed; top:0; z-index:150; width:100%;" class="shadow-md">
  {{ template "user-session-bar" . }}
</div>
```

Bar itself: amber-900/95 background, backdrop-blur, amber-600/50 bottom border, 64px tall, logo (`/tcnlogolg.png`, 40px tall) + back button on the left, "Welcome, {{.Username}}" + Logout button on the right (see style guide for exact CSS).

---

## 2. Main content wrapper

```html
<div style="padding-top:4rem;" class="pb-20 lg:pb-6">
  <div class="mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6" style="width:100%;">
    <!-- lg:max-width 85% -->
```
- `padding-top: 4rem` (64px) clears the fixed top bar.
- `padding-bottom`: `5rem` (80px) on mobile to clear the fixed bottom nav bar; drops to `1.5rem` at `lg` (1024px+) since the bottom nav is desktop-hidden.
- Content column: full width on mobile, capped at **85% max-width, centered** from `lg` breakpoint up. Horizontal padding scales `0.75rem → 1rem → 1.5rem` across `base/sm/lg`.

```css
.tcn-home-content { padding-top: 4rem; padding-bottom: 5rem; }
@media (min-width: 1024px) { .tcn-home-content { padding-bottom: 1.5rem; } }
.tcn-home-container { width: 100%; margin-inline: auto; padding: 1rem 0.75rem; }
@media (min-width: 640px) { .tcn-home-container { padding: 1.5rem 1rem; } }
@media (min-width: 1024px) { .tcn-home-container { max-width: 85%; padding-inline: 1.5rem; } }
```

---

## 3. Mobile quick-link panels (hidden on desktop)

Three equal-width gradient tiles in a row, **only rendered below `lg` (1024px)** — desktop drops this section entirely (its equivalent links live in the header UI elsewhere).

```html
<div class="lg:hidden" style="display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem; margin-bottom:1rem;">
  <a href="/TCN_Stats" class="quick-link-tile" style="background:linear-gradient(to bottom right, #059669, #065f46);">
    <svg><!-- bar-chart icon --></svg>
    <span>Statistics</span>
  </a>
  <a href="/TCN_TownHall" class="quick-link-tile" style="background:linear-gradient(to bottom right, #2563eb, #1e40af);">
    <svg><!-- message-square icon --></svg>
    <span>Community Building</span>
  </a>
  <a href="/TCN_LocalGovernance" class="quick-link-tile" style="background:linear-gradient(to bottom right, #d97706, #92400e);">
    <svg><!-- users icon --></svg>
    <span>Governance</span>
  </a>
</div>
```
```css
.quick-link-tile {
  border-radius: 0.75rem;
  padding: 0.75rem;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}
.quick-link-tile:hover { opacity: 0.9; }
.quick-link-tile svg { width: 1.25rem; height: 1.25rem; margin-bottom: 0.25rem; }
.quick-link-tile span { font-size: 0.75rem; font-weight: 500; }
```
Gradient stops (Tailwind → hex): Statistics = `emerald-600 → emerald-800` (`#059669 → #065f46`); Community Building = `blue-600 → blue-800` (`#2563eb → #1e40af`); Governance = `amber-600 → amber-800` (`#d97706 → #92400e`). Icons: `BarChart3`, `MessageSquare`, `Users` from lucide — swap for equivalent inline SVGs (e.g. from [lucide.dev](https://lucide.dev) static SVG export, or Feather/Heroicons equivalents) since you won't have the React icon package server-side.

---

## 4. Hero "Achimowin greet" panel

A full-bleed photo card, fixed `40vh` tall, rounded `2xl` (1rem) corners, containing a two-column grid (stacks to 1 column on mobile): greeting on the left, a CTA tile on the right.

```html
<div class="hero-panel">
  <img src="/panelBKG11.jpg" alt="Welcome Background" class="hero-panel-bg" />
  <div class="hero-panel-grid">
    <!-- Left: greeting -->
    <div class="hero-left">
      <div class="hero-greeting">
        <svg class="hero-greeting-icon"><!-- Megaphone icon --></svg>
        <div class="apptext">Tansi, {{.Username}}!</div>
      </div>
    </div>
    <!-- Right: CTA -->
    <div class="hero-right">
      <a href="/TCN_Achimowin" class="achimowinbtn">
        <div class="achimowinbtn-inner">
          <svg class="achimowinbtn-icon"><!-- Handshake icon --></svg>
          <div class="apptextlgB">TCN Achimowin</div>
        </div>
        <div class="apptextsmy">Building a stronger Tataskweyak Cree Nation together.</div>
      </a>
    </div>
  </div>
</div>
```

```css
.hero-panel {
  position: relative;
  height: 40vh;
  border-radius: 1rem;
  overflow: hidden;
  background: linear-gradient(to bottom right, #1c1917, #292524, #78350f); /* stone-900 -> stone-800 -> amber-900 fallback under the photo */
  margin-bottom: 1.5rem;
}
.hero-panel-bg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.hero-panel-grid {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  height: 100%;
}
@media (min-width: 1024px) {
  .hero-panel-grid { grid-template-columns: 1fr 1fr; padding: 2.5rem; }
}
.hero-left { display: flex; flex-direction: column; justify-content: flex-end; }
.hero-greeting { display: flex; align-items: center; gap: 1rem; color: white; }
.hero-greeting-icon { width: 3rem; height: 3rem; color: rgba(0,0,0,0.5); flex-shrink: 0; }
.hero-right { display: flex; flex-direction: column; justify-content: flex-end; align-items: center; }
@media (min-width: 1024px) { .hero-right { align-items: flex-end; } }
```

**`.achimowinbtn`** is a shared button style (also used elsewhere in the app) — a card with thick side borders and a wipe-in hover fill, already in `App.css`:
```css
.achimowinbtn {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-right: 1rem solid #704F4F;
  border-left: 1rem solid #704F4F;
  display: block;
  width: 100%;
}
.achimowinbtn::before {
  content: "";
  position: absolute; inset: 0;
  z-index: -1;
  background-color: rgba(255,255,255,0.25);
  transform: scaleX(0);
  transform-origin: right center;
  transition: transform 0.4s ease-out;
}
.achimowinbtn:hover::before { transform: scaleX(1); }
.achimowinbtn-inner {
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
.achimowinbtn-icon { width: 3.875rem; height: 3.875rem; color: rgba(0,0,0,0.5); }
```
Text classes used here (`.apptext`, `.apptextlgB`, `.apptextsmy`) are fluid-clamp typography — full definitions in `frontend-style-guide.md §3`.

---

## 5. Bento tile grid — the 9 main navigation tiles

A responsive grid: 1 column on mobile, 3 columns from `lg` up. Each tile is a full-bleed photo card with a bottom gradient scrim and title/description text, scaling the image slightly on hover.

```css
.tile-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 640px) { .tile-grid { gap: 1.25rem; } }
@media (min-width: 1024px) { .tile-grid { grid-template-columns: repeat(3, 1fr); } }

.nav-tile {
  display: block;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid #e7e5e4; /* stone-200 */
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  cursor: pointer;
}
.nav-tile:hover { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }

.nav-tile-media { position: relative; height: 100%; overflow: hidden; }
.nav-tile-media img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.5s ease;
}
.nav-tile:hover .nav-tile-media img { transform: scale(1.05); }
.nav-tile-scrim {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
}
.nav-tile-text {
  position: absolute;
  bottom: 0.75rem; left: 0.75rem; right: 0.75rem;
}
@media (min-width: 640px) { .nav-tile-text { bottom: 1rem; left: 1rem; } }
```
```html
<div class="tile-grid">
  {{ range .MainTiles }}
  <a href="{{.Link}}" class="nav-tile">
    <div class="nav-tile-media">
      <img src="{{.Image}}" alt="{{.Alt}}" />
      <div class="nav-tile-scrim"></div>
      <div class="nav-tile-text">
        <div class="apptextw">{{.Title}}</div>
        <div class="apptextmini">{{.Description}}</div>
      </div>
    </div>
  </a>
  {{ end }}
  <!-- Traditional Learning banner spans 2 columns, see §6 -->
</div>
```

### Tile data (title / image / link / description)

| Title | Image | Link | Description |
|---|---|---|---|
| My Profile | `/tcnuser.jpg` | `/Member_Account` | Account information and settings |
| Band Office | `/bandofficeinside.jpg` | `/TCN_BandOffice` | TCN admin office |
| TCN Bulletin Board | `/tcnbulltintile.jpg` | `/TCN_BulletinBoard` | Latest news, announcements, and updates. |
| Community Meetings | `/tcncommbuildtile.jpg` | `/TCN_Matters` | Announcements, and meeting updates. |
| TCN Health | `/tcnhealth.jpg` | `/TCN_Health` | Local health services and resources. |
| Local Services | `/tcnservicestile.jpg` | `/TCN_LocalServices` | Information about local services. |
| Employment & Training | `/tcnemptraintile.jpg` | `/TCN_E_T` | Job opportunities, skills training programs. |
| Land Stewardship | `/tcnlandstewardtile.jpg` | `/TCN_TRSC` | Land use management and conservation. |
| TCN Links | `/tcnlinks.jpg` | `/TCN_Links` | Related Facebook pages and other links |

That's 9 tiles filling 3 full rows of the 3-column grid exactly.

---

## 6. "Traditional Learning" banner (full-width bottom row)

Spans 2 of the 3 grid columns on tablet+ (`md:col-span-2` — on a 3-col `lg` grid this reads as roughly two-thirds width; simplest Go/HTMX port is to just make it `grid-column: span 2` at the same breakpoint the tile grid goes 3-wide, or span the full row if you'd rather simplify). No image — solid amber gradient card, icon badge, heading, "Coming Soon" tag, body copy.

```html
<div class="learning-banner" style="grid-column: span 2;">
  <div class="learning-banner-row">
    <div class="learning-banner-badge">
      <svg><!-- GraduationCap icon --></svg>
    </div>
    <div>
      <h2 class="learning-banner-title">Traditional Learning</h2>
      <p class="learning-banner-tag">Coming Soon</p>
    </div>
    <p class="learning-banner-copy">
      Preserving and sharing our language, culture, and traditional knowledge with future generations.
      Language lessons, cultural workshops, and elder teachings.
    </p>
  </div>
</div>
```
```css
.learning-banner {
  background: linear-gradient(to right, #b45309, #78350f); /* amber-700 -> amber-900 */
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  padding: 1.25rem;
  color: white;
}
@media (min-width: 640px) { .learning-banner { padding: 1.5rem; } }
.learning-banner-row {
  display: flex; flex-direction: column; gap: 1rem;
}
@media (min-width: 640px) { .learning-banner-row { flex-direction: row; align-items: center; } }
.learning-banner-badge {
  width: 3rem; height: 3rem; flex-shrink: 0;
  border-radius: 0.75rem;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
}
.learning-banner-badge svg { width: 1.5rem; height: 1.5rem; color: #fde68a; } /* amber-200 */
.learning-banner-title { font-size: 1.125rem; font-weight: 700; }
@media (min-width: 640px) { .learning-banner-title { font-size: 1.25rem; } }
.learning-banner-tag { color: #fde68a; font-size: 0.75rem; font-weight: 500; }
.learning-banner-copy { color: rgba(255,255,255,0.8); font-size: 0.875rem; }
@media (min-width: 640px) { .learning-banner-copy { flex: 1; } }
```

---

## 7. Fixed mobile bottom navigation (hidden on desktop)

A 5-icon bar fixed to the bottom of the viewport, white background, top border, safe-area padding for notched phones, hidden entirely at `lg` breakpoint.

```html
<nav class="mobile-bottom-nav lg:hidden safe-area-bottom">
  <div class="mobile-bottom-nav-row">
    <a href="/TCN_Home" class="mobile-bottom-nav-item is-active">
      <svg><!-- Home, stroke-width 2.5 when active --></svg><span>Home</span>
    </a>
    <a href="/TCN_BulletinBoard" class="mobile-bottom-nav-item">
      <svg><!-- ClipboardList --></svg><span>Bulletin</span>
    </a>
    <a href="/TCN_Forms" class="mobile-bottom-nav-item">
      <svg><!-- FileText --></svg><span>Sign-up</span>
    </a>
    <a href="/Member_Account" class="mobile-bottom-nav-item">
      <svg><!-- User --></svg><span>Account</span>
    </a>
    <a href="/TCN_BandOffice" class="mobile-bottom-nav-item">
      <svg><!-- Briefcase --></svg><span>Directory</span>
    </a>
  </div>
</nav>
```
```css
.mobile-bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0;
  z-index: 50;
  background: white;
  border-top: 1px solid #e7e5e4; /* stone-200 */
  box-shadow: 0 -4px 6px -1px rgba(0,0,0,0.1);
}
.mobile-bottom-nav-row {
  display: flex; align-items: center; justify-content: space-evenly;
  height: 4rem; padding-inline: 0.25rem;
}
.mobile-bottom-nav-item {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 3.5rem; height: 100%; padding: 0.5rem 0;
  color: #78716c; /* stone-500 */
  transition: color 0.2s;
}
.mobile-bottom-nav-item:hover { color: #d97706; } /* amber-600 */
.mobile-bottom-nav-item.is-active { color: #b45309; } /* amber-700 */
.mobile-bottom-nav-item svg { width: 1.25rem; height: 1.25rem; }
.mobile-bottom-nav-item.is-active svg { stroke-width: 2.5; }
.mobile-bottom-nav-item span { font-size: 0.625rem; margin-top: 0.25rem; font-weight: 500; }
```
Mark `.is-active` server-side by comparing the current request path to each link (same job `usePathname()` does client-side in the React version).

`.safe-area-bottom` (from `globals.css`, keep as-is):
```css
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
```

---

## 8. Entrance animation (optional, nice-to-have)

The React version staggers each tile in with Framer Motion (`opacity 0→1`, `y: 20→0`, `0.4s`, `staggerChildren: 0.08s`, `delayChildren: 0.1s`). Pure-CSS equivalent for the Go/HTMX port — apply a shared class to each tile and stagger `transition-delay` in a loop:

```css
.fade-in-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-in-up.is-visible { opacity: 1; transform: translateY(0); }
```
```html
<a class="nav-tile fade-in-up" style="transition-delay: {{mul .Index 0.08}}s;">
```
Trigger `.is-visible` on `DOMContentLoaded` (or immediately, since this content is above the fold and not scroll-gated in the original) via a few lines of vanilla JS or an HTMX `hx-on::load` handler. This is purely cosmetic — skip it if you want a simpler first pass.

---

## 9. Notes on dead/unused code in the source

Two things in the original React file are effectively inert and **don't need porting**:
- A `departments` array (Contact Directory / Local Governance / Sign-Up Forms / TCN Links tiles) is defined but never rendered anywhere in the current JSX — leftover from an earlier layout.
- `useIsDesktop()` is called but its result (`isDesktop`) is never used — the desktop/mobile split is instead handled entirely via Tailwind's `lg:` responsive classes (`hidden lg:block` / `lg:hidden`), which is also the simpler approach for the Go/HTMX port: render both variants and toggle visibility with CSS media queries rather than branching server-side on user-agent or viewport.

One live route mismatch to be aware of: the mobile quick-link panel links to `/TCN_TownHall`, but git status on this repo shows `TCN_TownHall/page.tsx` was deleted in the current rebuild — so that link is currently dead in the source app too. Decide whether to point it at a real route or drop that tile when you port it.
