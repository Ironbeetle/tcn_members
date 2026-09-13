# Building TCN_Links in HTMX + Go

A section-by-section spec for recreating `/TCN_Links` (`src/app/TCN_Links/page.tsx`) as a server-rendered Go template. This is one of the simplest pages in the app — a title panel plus two static link lists, no client-side interactivity or dynamic data required. Everything here is framework-agnostic and can be dropped into a `.html`/`.tmpl` file almost verbatim.

Cross-reference: color tokens, fluid type classes, and the base `.genbkg` background pattern are documented in `frontend-style-guide.md` — this doc only repeats what's specific to this page.

---

## 0. Page skeleton

```
<body> (bg-background, text-foreground — from globals.css base layer)
└── div.genbkg (full-page background image, min-height: 100vh)
    ├── Fixed top bar (UserSessionBar)
    └── Main content wrapper (max-width 5xl, centered, padding-top to clear fixed bar)
        ├── Title panel ("TCN Links" hero strip)
        └── Two-column bento grid
            ├── Facebook Pages panel (list of link cards)
            └── Websites panel (list of link cards)
```

Root container:
```html
<div class="genbkg" style="min-height:100vh;">
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

Same `UserSessionBar` component used everywhere else in the authenticated app — see `frontend-style-guide.md §4`. Fixed to the top, full width, drop shadow:

```html
<div style="position:fixed; top:0; z-index:50; width:100%;" class="shadow-md">
  {{ template "user-session-bar" . }}
</div>
```

Bar itself: amber-900/95 background, backdrop-blur, amber-600/50 bottom border, 64px tall, logo (`/tcnlogolg.png`, 40px tall) + back button on the left, "Welcome, {{.Username}}" + Logout button on the right (see style guide for exact CSS). Note: the React source also imports `Backbtn` directly in this page file, but never renders it there — it's dead code. The actual back button on screen comes from inside `UserSessionBar` itself, so you only need to implement the bar once, not twice.

---

## 2. Main content wrapper

```html
<main class="tcn-links-main">
  ...
</main>
```
```css
.tcn-links-main {
  max-width: 64rem; /* max-w-5xl */
  margin-inline: auto;
  padding: 6rem 0.75rem 5rem; /* pt-24 pb-20, px-3 */
}
@media (min-width: 640px) { .tcn-links-main { padding-left: 1rem; padding-right: 1rem; } }
@media (min-width: 1024px) { .tcn-links-main { padding-left: 1.5rem; padding-right: 1.5rem; } }
```
- `padding-top: 6rem` (96px) clears the fixed top bar with extra breathing room.
- `padding-bottom: 5rem` (80px) — note this page has no fixed bottom mobile nav bar in the source, but the padding is present anyway (leftover convention from other pages); keep it or drop it, doesn't matter functionally.
- Content column: capped at `64rem` (1024px), centered, no responsive width change — unlike TCN_Home this page does **not** go to 85%-width on desktop, it just stays capped at `max-w-5xl`.

---

## 3. Title panel

A single full-width hero strip: dark gradient background, a background photo at 50% opacity behind it, a circular icon badge, and a title + subtitle. No CTA button, no grid — much simpler than the TCN_Home hero.

```html
<div class="links-title-panel">
  <img src="/panelBKG11.jpg" alt="Links Background" class="links-title-panel-bg" />
  <div class="links-title-panel-content">
    <div class="links-title-icon">
      <svg><!-- Wifi icon --></svg>
    </div>
    <div>
      <h1 class="links-title-h1">TCN Links</h1>
      <p class="links-title-sub">Community Facebook pages and related websites.</p>
    </div>
  </div>
</div>
```
```css
.links-title-panel {
  position: relative;
  overflow: hidden;
  border-radius: 1rem; /* rounded-2xl */
  background: linear-gradient(to bottom right, #1c1917, #292524, #78350f); /* stone-900 -> stone-800 -> amber-900 */
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); /* shadow-xl */
  margin-bottom: 1.5rem;
}
.links-title-panel-bg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0.5;
}
.links-title-panel-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
}
@media (min-width: 640px) { .links-title-panel-content { padding: 2rem; } }
@media (min-width: 1024px) { .links-title-panel-content { padding: 2.5rem; } }
.links-title-icon {
  width: 3rem; height: 3rem;
  flex-shrink: 0;
  border-radius: 9999px;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
}
.links-title-icon svg { width: 1.5rem; height: 1.5rem; color: white; }
.links-title-h1 {
  font-size: 1.5rem; font-weight: 700; color: white;
}
@media (min-width: 640px) { .links-title-h1 { font-size: 1.875rem; } }
.links-title-sub {
  color: #fde68a; /* amber-200 */
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
@media (min-width: 640px) { .links-title-sub { font-size: 1rem; } }
```
Icon: `Wifi` from lucide — swap for an inline SVG (e.g. from [lucide.dev](https://lucide.dev) static export) since you won't have the React icon package server-side.

---

## 4. Two-panel bento grid

Two equal-width white cards side by side on desktop, stacked on mobile. Each has a colored gradient header bar and a list of link rows.

```css
.links-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}
@media (min-width: 768px) { .links-grid { grid-template-columns: 1fr 1fr; } }

.links-panel {
  background: white;
  border-radius: 1rem; /* rounded-2xl */
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid #e7e5e4; /* stone-200 */
  overflow: hidden;
}
.links-panel-header {
  padding: 1rem 1.25rem;
  display: flex; align-items: center; gap: 0.75rem;
}
.links-panel-header svg { width: 1.25rem; height: 1.25rem; color: white; }
.links-panel-header h2 { font-weight: 700; color: white; font-size: 1rem; }

.links-panel-fb .links-panel-header {
  background: linear-gradient(to right, #1d4ed8, #1e3a8a); /* blue-700 -> blue-900 */
}
.links-panel-web .links-panel-header {
  background: linear-gradient(to right, #b45309, #78350f); /* amber-700 -> amber-900 */
}

.links-panel-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.links-empty {
  color: #a8a29e; /* stone-400 */
  font-size: 0.875rem;
  font-style: italic;
  padding: 1rem 0;
  text-align: center;
}
```

```html
<div class="links-grid">
  <!-- Facebook Pages panel -->
  <div class="links-panel links-panel-fb">
    <div class="links-panel-header">
      <svg><!-- Users icon --></svg>
      <h2>Facebook Pages</h2>
    </div>
    <div class="links-panel-body">
      {{ if .FacebookLinks }}
        {{ range .FacebookLinks }}
          {{ template "link-card" (dict "Item" . "Type" "facebook") }}
        {{ end }}
      {{ else }}
        <p class="links-empty">Links coming soon.</p>
      {{ end }}
    </div>
  </div>

  <!-- Websites panel -->
  <div class="links-panel links-panel-web">
    <div class="links-panel-header">
      <svg><!-- Globe icon --></svg>
      <h2>Websites</h2>
    </div>
    <div class="links-panel-body">
      {{ if .WebsiteLinks }}
        {{ range .WebsiteLinks }}
          {{ template "link-card" (dict "Item" . "Type" "website") }}
        {{ end }}
      {{ else }}
        <p class="links-empty">Links coming soon.</p>
      {{ end }}
    </div>
  </div>
</div>
```

---

## 5. Link card (shared partial)

Each row: a rounded bordered "card" that's actually a full anchor tag, with a circular icon badge on the left (blue Users icon for Facebook items, amber Globe icon for website items), name + optional description in the middle, and an external-link icon on the right that only shows on hover (desktop) — on touch devices it's just always faintly visible since there's no hover state, so simplest to leave it always-visible at low opacity, or match the CSS `:hover` exactly and accept it's invisible until tapped-and-held on mobile.

```html
<a href="{{.Item.URL}}" target="_blank" rel="noopener noreferrer" class="link-card">
  <div class="link-card-icon">
    {{ if eq .Type "facebook" }}
      <svg class="icon-users"><!-- Users icon, blue-600 --></svg>
    {{ else }}
      <svg class="icon-globe"><!-- Globe icon, amber-700 --></svg>
    {{ end }}
  </div>
  <div class="link-card-text">
    <p class="link-card-name">{{.Item.Name}}</p>
    {{ if .Item.Description }}
      <p class="link-card-desc">{{.Item.Description}}</p>
    {{ end }}
  </div>
  <svg class="link-card-ext"><!-- ExternalLink icon --></svg>
</a>
```
```css
.link-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e7e5e4; /* stone-200 */
  transition: background-color 0.2s, border-color 0.2s;
  cursor: pointer;
}
.link-card:hover {
  background-color: #fffbeb; /* amber-50 */
  border-color: #fcd34d; /* amber-300 */
}
.link-card-icon {
  flex-shrink: 0;
  width: 2.5rem; height: 2.5rem;
  border-radius: 9999px;
  background: linear-gradient(to bottom right, #fef3c7, #fde68a); /* amber-100 -> amber-200 */
  display: flex; align-items: center; justify-content: center;
}
.link-card-icon svg { width: 1.25rem; height: 1.25rem; }
.link-card-icon .icon-users { color: #2563eb; } /* blue-600 */
.link-card-icon .icon-globe { color: #b45309; } /* amber-700 */
.link-card-text { flex: 1; min-width: 0; }
.link-card-name {
  font-weight: 600;
  color: #292524; /* stone-800 */
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: color 0.2s;
}
.link-card:hover .link-card-name { color: #b45309; } /* amber-700 */
.link-card-desc {
  font-size: 0.875rem;
  color: #78716c; /* stone-500 */
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.link-card-ext {
  flex-shrink: 0;
  width: 1rem; height: 1rem;
  color: #a8a29e; /* stone-400 */
  transition: color 0.2s;
}
.link-card:hover .link-card-ext { color: #b45307; } /* amber-700 */
```
Icons: `Users`, `Globe`, `ExternalLink` from lucide — swap for inline SVGs same as elsewhere.

---

## 6. Link data

The source hardcodes two Go-slice-shaped arrays directly in the page component (not fetched from a database or CMS). Simplest port: define equivalent structs/slices server-side, or hardcode the same list directly in the Go template/handler.

**Facebook Pages:**

| Name | URL | Description |
|---|---|---|
| Tataskweyak Cree Nation | https://www.facebook.com/groups/Tataskweyak306 | TCN FB Group |
| Tataskweyak Health Message Board | https://www.facebook.com/groups/tcnhealth | TCN FB Group |
| Tataskweyak Community Development | https://www.facebook.com/groups/tataskweyakccp | TCN FB Group |
| TCN Employment & Training Opportunities | https://www.facebook.com/groups/1527138060707095 | TCN FB Group |
| TCN Resource On-reserve On-line Activities | https://www.facebook.com/groups/987884548774978 | TCN FB Group |

**Websites:**

| Name | URL | Description |
|---|---|---|
| Chief Sam Cook School | https://www.cscmec.ca/ | Chief Sam Cook Mahmuwee Education Centre |

All links open in a new tab (`target="_blank" rel="noopener noreferrer"`).

Suggested Go struct:
```go
type LinkItem struct {
    Name        string
    URL         string
    Description string
}
```
(The `Type` field in the React source — `"facebook" | "website"` — only exists to pick the icon/color; in the Go port it's simpler to pass that as a template argument per-panel, as shown in §4/§5, rather than storing it on each item.)

---

## 7. Entrance animation (optional, nice-to-have)

The React version staggers the two grid panels in with Framer Motion (`opacity 0→1`, `y: 20→0`, `0.4s`, `staggerChildren: 0.08s`, `delayChildren: 0.1s`), and fades the title panel in separately (`0.5s`, `delay: 0.1s`). Pure-CSS equivalent for the Go/HTMX port:

```css
.fade-in-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-in-up.is-visible { opacity: 1; transform: translateY(0); }
```
Apply `.fade-in-up` to `.links-title-panel` and to each `.links-panel`, staggering `transition-delay` slightly between the two panels (e.g. `0s` and `0.08s`). Trigger `.is-visible` on load via a few lines of vanilla JS or an HTMX `hx-on::load` handler. This is purely cosmetic — skip it if you want a simpler first pass; the page is fully functional and readable without it.

---

## 8. Notes on dead/unused code in the source

- The page imports `Backbtn` from `@/components/Backbtn` but never renders it in its own JSX — see §1. Don't port a standalone back button for this page; it's already inside `UserSessionBar`.
- No dynamic data, no auth-gated content beyond the session bar itself, and no client-side state — this page is effectively static markup once you strip the animation wrapper. It's a good first page to port if you're starting the HTMX/Go migration, since there's nothing to wire up beyond the two link lists.
