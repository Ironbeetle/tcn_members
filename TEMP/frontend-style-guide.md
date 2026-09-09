# TCN Members — Frontend Style Guide
Reference for recreating the look and feel in the HTMX + Go rebuild.

Source app stack: Next.js 16, Tailwind CSS v4 (CSS-first `@theme`), Framer Motion for animation, `lucide-react` for icons. No custom webfont is actually loaded (the `--font-geist-sans` CSS var is declared but never wired up via `next/font`), so everything renders in the browser's default sans-serif stack. **You do not need to source Geist** — just use `system-ui, -apple-system, "Segoe UI", sans-serif` or similar.

---

## 1. Color System

There are two color layers in this app: a **shadcn/ui-style neutral theme** (used for base page background, cards, buttons from the `ui/` component kit) and a set of **hand-rolled brand colors** used throughout the actual content (amber/brown "wood" tones, greens, and near-black text). The brand colors are what give the app its identity — prioritize those when recreating the look.

### 1.1 Base theme tokens (globals.css, OKLCH)

Defined as CSS custom properties, light mode only is actively used (no dark-mode toggle wired into the UI):

| Token | OKLCH | Approx Hex | Usage |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` | `#FFFFFF` | page background fallback |
| `--foreground` | `oklch(0.147 0.004 49.25)` | `#252220` | default text |
| `--primary` | `oklch(0.216 0.006 56.043)` | `#38332F` | primary buttons |
| `--primary-foreground` | `oklch(0.985 0.001 106.423)` | `#FBFAF9` | text on primary |
| `--secondary` / `--muted` / `--accent` | `oklch(0.97 0.001 106.424)` | `#F7F6F5` | subtle panels |
| `--muted-foreground` | `oklch(0.553 0.013 58.071)` | `#8A817A` | secondary text |
| `--border` / `--input` | `oklch(0.923 0.003 48.717)` | `#E5E2DF` | hairlines |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `#DC2626`-ish red | errors/delete |
| `--radius` | `0.625rem` (10px) | — | base corner radius (sm/md/lg/xl derived by ±4px, ±2px) |

In practice this base theme is mostly invisible — nearly every page overrides it with a full-bleed background image (`.genbkg`) and the brand palette below.

### 1.2 Brand palette (the actual "TCN look")

| Color | Hex / RGBA | Where it's used |
|---|---|---|
| **Amber/brown wood** | Tailwind `amber-900` (`#78350F`), `amber-700` (`#B45309`), `amber-600` (`#D97706`) | Top nav bars, mobile section nav, section dividers, gradient CTA buttons |
| **Muted red-brown accent** | `#704F4F` | Decorative borders (`.borderbot`, `.bordertop`, `.borderright`, `.panelalt`, `.paneltall`), side borders on `.achimowinbtn` |
| **Forest green** | `#529C67` / `#539B67` | `.pagebtn` background, `.paneltall` background — secondary "go" actions |
| **Dark umber** | `#7b3306` | `.techtxtbbb` heading background chip |
| **Near-black text** | `rgba(25,25,25,0.7)` (~`#191919` at 70% opacity) | Most body/heading text over light or photo backgrounds (`.apptext*`, `.techtxt*`) |
| **Off-white text** | `rgba(250,250,250,0.7)` (~`#FAFAFA` at 70%) | Text over dark photo backgrounds (`.apptextw`, `.apptextwsm`, `.apptextmini`) |
| **Warm yellow accent** | `rgba(251,231,77,1)` / `rgba(245,235,157,0.8)` (~`#FBE74D` / `#F5EB9D`) | Callout/highlight text (`.apptextsmy`, `.techtxttitley`, `.techtxtmby`) |
| **Hamburger menu gradient** | `linear-gradient(to bottom, #ffcb21, #2f2607)` | Off-canvas mobile menu panel — bright gold fading to near-black brown |
| **Overlay scrims** | `rgba(27,27,27,0.4)` and `rgba(0,0,0,0.4)`→`transparent`→`rgba(0,0,0,0.3)` gradients | Darkening full-bleed photo backgrounds so white text stays legible |

**Recreate this in plain CSS as:**
```css
:root {
  --tcn-amber-900: #78350f;
  --tcn-amber-700: #b45309;
  --tcn-amber-600: #d97706;
  --tcn-wood-border: #704f4f;
  --tcn-green: #529c67;
  --tcn-umber: #7b3306;
  --tcn-text-dark: rgba(25, 25, 25, 0.7);
  --tcn-text-light: rgba(250, 250, 250, 0.7);
  --tcn-highlight-yellow: rgba(251, 231, 77, 1);
  --tcn-radius: 0.625rem;
}
```

---

## 2. Layout & Background Patterns

### 2.1 Full-page photo backgrounds
Nearly every page wraps its content in a full-viewport div with a fixed, cover-fit background photo plus a `min-h-screen` container. Class name is `.genbkg`, backed by `/regbkg.jpg`:

```css
.genbkg {
  background-image: url("/regbkg.jpg");
  background-size: cover;
  background-position: center;
  background-attachment: fixed; /* parallax feel on scroll */
}
```

Page-specific variants swap the image and sometimes the `background-attachment` (`scroll` vs `fixed`) or add a fixed height (`100vh`/`80vh`):
- `.techbkg` — linear gradient `rgb(4,0,113)` → `rgb(47,134,255)` (blue tech gradient, no photo)
- `.tcnaboutbkg`, `.panel`, `.about_tile`, `.territorybkg`, `.bhallbkg`, `.ecdevbkg`, `.photobkg`, `.ATKbkg`, `.ancientbkg`, `.tcnvision`, `.topbkg` — each a dedicated hero/section photo with `cover`/`center` or `top` positioning

**Pattern to reuse:** one generic `.page-bg` utility class per page/section, pointing at a themed JPG, always `background-size: cover`, almost always `background-attachment: fixed` on desktop for a subtle parallax.

### 2.2 Overlay scrims for text legibility
Hero sections lay a semi-transparent gradient over the photo before placing text, e.g.:
```css
background: linear-gradient(to bottom, rgba(0,0,0,0.4), transparent, rgba(0,0,0,0.3));
```
This is applied as an absolutely-positioned full-cover `div` (`inset-0`) sitting between the background image and the content (`z-index` 0 vs 10).

### 2.3 Card / panel treatments
Two card styles recur:
- **`.panelalt`** — translucent light card: `background-color: rgba(197,192,192,0.5)`, `border-radius: 1rem`, `4px` solid `#704F4F` border, drop shadow `3px 10px 8px rgba(0,0,0,0.3)`, hover brightens to `rgba(255,255,255,0.3)`, `transition: all 0.3s ease`.
- **`.paneltall`** — same shape/border/shadow but solid green fill `#539B67`.

Buttons/link overlays (`.btnlayer`, `.btnlayerlg`) use a translucent white pill (`rgba(250,250,250,0.5)` → `0.7` on hover) with a `translateY(-4px)` lift on hover.

The **CTA button** style seen at the bottom of Achimowin_Intro (and used as the primary "go" action pattern) is a horizontal amber gradient with lift + glow on hover:
```css
background: linear-gradient(to right, #b45309, #d97706, #b45309); /* amber-700 → amber-600 → amber-700 */
/* hover: */
background: linear-gradient(to right, #d97706, #f59e0b, #d97706); /* one shade lighter */
border-radius: 0.75rem; /* rounded-xl */
box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); /* shadow-2xl */
border: 2px solid rgba(245, 158, 11, 0.5); /* amber-500/50 */
transition: all 0.3s;
/* hover: transform: scale(1.05); box-shadow glows amber */
```

### 2.4 Section dividers
A thin horizontal rule pattern recurs between content blocks:
```css
height: 5px;
width: 100%;
background-color: #78350f; /* amber-900 */
border-bottom: 1px solid rgba(217, 119, 6, 0.5); /* amber-600/50 */
margin: 3rem 0;
```

---

## 3. Typography Scale

All type sizes use `clamp()` for fluid responsive scaling (no breakpoint-specific font-size overrides needed). Two parallel systems exist — `.apptext*` (older/general pages) and `.techtxt*` (used on the Achimowin Intro / Technology-style pages). Weight, color, and alignment are baked into each class.

| Class | Font size (clamp) | Weight | Color | Notes |
|---|---|---|---|---|
| `.apptextTitle` / `.apptextlg` | `2.5rem → 5rem` | 600/500 | dark 0.7 | Page hero titles |
| `.apptextlgBold` | `2.5rem → 4rem` | 700 | dark 0.7 | Bold hero |
| `.apptextBold` | `1.5rem → 3rem` | 700 | dark 0.7 | Section heading |
| `.apptextBoldw` | `1rem → 4rem` | 700 | white 0.7 | Section heading, on dark bg |
| `.apptextlgB` | `1.5rem → 3.5rem` | 600 | `rgba(26,26,26,0.5)` | Subheading |
| `.apptext` | `1.5rem → 2rem` | 500 | dark 0.7, centered | Body/lead |
| `.apptextw` / `.apptextwsm` | `1.5rem→2.3rem` / `1rem→1.8rem` | 600/500 | white 0.7 | Body on photo bg |
| `.apptextsmy` | `0.75rem → 1.5rem` | 500 | yellow highlight, centered | Callout text |
| `.apptextmini` | `0.5rem → 1.2rem` | 400 | white 0.7 | Fine print on photo bg |
| `.apptextminib` | `0.5rem → 1.2rem` | 600 | dark 0.7, centered, pill badge (rounded, bordered, translucent white bg) | Tag/badge text |
| `.techtxttitle` | `2rem → 3.5rem` | 500 | dark 0.7, centered | **Used for the Achimowin Intro hero title** |
| `.techtxttitley` | `2rem → 3.5rem` | 500 | yellow highlight, centered | Hero title, highlight variant |
| `.techtxtbbb` | `1.5rem → 2.75rem` | 600 | white 0.6, on `#7b3306` chip bg, `1rem` padding | Section heading "chip" |
| `.techtxtbb` | `1.4rem → 2.75rem` | 550 | dark 0.7 | Section heading, no chip |
| `.techtxtmb` | `1.5rem → 2.25rem` | 500 | dark 0.7 | Body copy |
| `.techtxtmbb` | `1.5rem → 2.25rem` | 600 | dark 0.8 | Bold inline label (used for list-item lead-ins) |
| `.techtxtmby` | `1.25rem → 2rem` | 700 | yellow highlight | Bold highlight body |
| `.techtxtsb` / `.techtxtsbb` | `1rem → 1.5rem` | 500 / 700 | dark 0.7 | Small text / small bold |

**Generic fluid-type helpers** (from App.css, decoupled from color):
```css
.text-body-sm { font-size: clamp(0.9375rem, 1.5vw + 0.5rem, 1.0625rem); line-height: 1.6; }
.text-body    { font-size: clamp(1.0625rem, 1.8vw + 0.5rem, 1.1875rem); line-height: 1.7; }
.text-body-lg { font-size: clamp(1.1875rem, 2vw + 0.5rem, 1.375rem); line-height: 1.7; }
.text-body-xl { font-size: clamp(1.3125rem, 2.2vw + 0.5rem, 1.5rem); line-height: 1.6; }
.text-heading-sm { font-size: clamp(1.375rem, 2.5vw + 0.5rem, 1.75rem); }
.text-heading    { font-size: clamp(1.625rem, 3vw + 0.5rem, 1.875rem); }
```

**For the Go/HTMX port:** replicate with plain CSS custom properties + `clamp()`; the exact formulas above can be copy-pasted verbatim since they're framework-agnostic.

---

## 4. Navigation Chrome

Every authenticated page uses a fixed top bar (`UserSessionBar` component) plus, on mobile, a secondary horizontal scroll nav:

```css
/* Top bar */
background-color: rgba(120, 53, 15, 0.95); /* amber-900/95 */
backdrop-filter: blur(4px);
border-bottom: 1px solid rgba(217, 119, 6, 0.5); /* amber-600/50 */
height: 4rem; /* 64px, h-16 */
padding-inline: 1rem–2rem; /* px-4 lg:px-8 */
display: flex; justify-content: space-between; align-items: center;
```
Content: logo (`<img>`, `h-10` / 40px tall) + back button on the left, "Welcome, {username}" + Logout button on the right. Logout button: amber-700 bg, amber-800 on hover, white text, amber-600 border, outline variant.

Un-authenticated variant (e.g. Achimowin_Intro) swaps the session bar for a simpler bar with just a back button and centered/left logo, same amber-900 + blur + amber-600/50 border treatment. Mobile: `h-14`, condensed; Desktop (`lg:` breakpoint, 1024px+): `h-16`, logo `max-width: 90px`.

Legacy hamburger menu (`.menuToggle`, `.menu` in App.css) is an off-canvas slide-in panel, 400px wide, full height, gradient background `linear-gradient(to bottom, #ffcb21, #2f2607)`, sliding in from the left via `transform: translateX(-100%)` → `translateX(0)` with a `cubic-bezier(0.77,0.2,0.05,1.0)` easing over 0.5s. Three animated `<span>` bars morph into an X (rotate 45°/-45°, middle bar fades out) when checked.

---

## 5. Motion / Interaction Patterns

Framer Motion drives nearly all entrance animation, in a consistent recipe:
- **Fade+slide-up on scroll-into-view:** `initial={{opacity:0, y:12–20}}`, `whileInView={{opacity:1, y:0}}`, `viewport={{once:true}}`, `transition={{duration:0.5, ease:"easeInOut"}}`, often staggered with an incrementing `delay` (0.1, 0.2, 0.3…) per sibling, or via `staggerChildren: 0.12` on a parent `<motion.ul>`.
- **Hero entrance (page load, not scroll-triggered):** logo fades+drops in (`y:-20 → 0`), heading fades+rises (`y:20 → 0`, `delay:0.2`), scroll-indicator chevron fades in late (`delay:1.2`) then loops a gentle bounce (`y:[0,10,0]`, `duration:1.5`, `repeat:Infinity`).
- **Hover micro-interactions (CSS, not JS):** cards/buttons lift (`translateY(-4px)`) or scale (`scale(1.05)`) with `transition: all 0.3s ease`; background opacity brightens on hover for translucent panels.

**For HTMX/Go recreation:** since HTMX has no built-in animation library, replicate the "fade+rise on scroll into view" pattern with a small IntersectionObserver + CSS transition (`opacity 0→1`, `transform: translateY(12px)→0`, `0.5s ease-in-out`), and stagger via `transition-delay` per child. The looping bounce and hover lift/scale/glow are pure CSS and port directly.

---

## 6. Achimowin_Intro Page — Structural Walkthrough

This is the unauthenticated marketing/explainer page at `/Achimowin_Intro` ("How TCN Achimowin Works"), the one to mirror pixel-for-pixel in the Go rebuild.

**Page shell:** `.genbkg` full-bleed background (`/regbkg.jpg`), `min-h-screen`, relative positioning.

**1. Fixed nav** (top, `z-[100]`):
- Mobile (`<1024px`): amber-900/blur bar, `h-14`, just a back button.
- Desktop (`≥1024px`): amber-900/blur bar, `h-16`, TCN logo (max 90px wide) left, back button right.

**2. Hero section** (`min-h-screen`, centered flex column):
- Dark gradient scrim over the background (`black/40 → transparent → black/30`, top to bottom).
- Centered content, `max-width: 72rem` (`max-w-6xl`):
  - Achimowin logo image (`/Achimowin_Logo.png`), 150–250px wide depending on breakpoint, fades+drops in.
  - `<h1>` "How TCN Achimowin Works" styled `.techtxttitle`, fades+rises in with 0.2s delay.
  - Absolutely-positioned "Scroll Down" indicator at the bottom: small `.techtxtsb` label + bouncing chevron-down SVG icon (amber-700), looping.

**3. Content sections** — repeating pattern of alternating text/image two-column grids (`grid-cols-1` mobile → `lg:grid-cols-5` or `lg:grid-cols-2` desktop), each preceded by a `.techtxtbbb` chip heading, separated by the amber-900 divider rule. Sections, in order:
  1. **"How the System Works"** — intro paragraph + bullet list of 4 sub-apps (Band Office, Bulletin Board, Event Manager, Public Alerts), each bullet's label bold (`.techtxtmbb`) followed by a plain-text description; paired with `/tcnsystemdiagram.png` (shown inline on mobile inside a black/25 rounded-full frame, in the second grid column on desktop).
  2. **"Data Ownership and Privacy"** — two-column: text (`.techtxtmbb` heading + `.techtxtmb` body) paired with `/dataprivate.png`.
  3. **"Communication Channels"** — bullet list of 3 channels (SMS, Email, Push), paired with two illustration images (`/sittingonatv.png`, `/tcnmaletruck.png`), plus a closing single-line `.techtxtbb` statement.
  4. **"The Heart of the System: TCN Member Database"** — text + bullet list of 4 benefits, paired with `/centralmemberdb.png`.
  5. **"Fast & Easy Identification"** — barcode explainer: text + an actual barcode image (`/TCNbar_code.jpg`) inside a white card with a 2px amber-900 border and rounded corners + shadow, paired with `/phoneappview.png`.
  6. **Barcode use-cases** — two paragraph-style bullets (no bold label) about emergency use + service identification, plus a staggered bullet list of 6 program areas (Community Services, Emergency Preparedness, Health, Recreation, Public Utilities, Traditional Land Use), paired with `/barcodescanned.png`.
  7. **"The Registration Process"** — staggered 5-item bullet walkthrough of account activation rules (18+ requirement, treaty number + birthdate matching, etc.), paired with `/tcngroup1.png`, followed by a second sub-block (fingerprint login, network access) paired with `/tcnfemalecouch.png`.

  Each divider between sections: `2px`-ish (`h-[5px]`) full-width amber-900 bar with amber-600/50 bottom border, `3rem` vertical margin (some hidden on mobile via `hidden lg:block`).

**4. Final CTA section** (`max-w-7xl`, centered):
  - Achimowin logo again (same size treatment as hero).
  - Two centered `.techtxtbb` lines: "100% TCN created and operated." / "It belongs to us, and it will grow with us."
  - Primary CTA button linking to `/TCN_Enter`: amber gradient pill button (see §2.3 CTA spec above) reading "Enter TCN Achimowin" with a right-arrow icon, fade+rise entrance with `scale(1.05)` + amber glow on hover.

**Responsive rules used throughout:** grid columns collapse to 1 below `lg` (1024px); images that appear inline-with-text on mobile move to a dedicated side column on desktop (toggled via `block lg:hidden` / `hidden lg:block` pairs rather than reflow); text stays left-aligned in content blocks but center-aligned in hero/CTA blocks.

---

## 7. Assets referenced (recreate or re-export these)

| File | Purpose |
|---|---|
| `/regbkg.jpg` | Generic full-page background (`.genbkg`) |
| `/tcnlogolg.png`, `/tcnlogosm.png` | TCN wordmark/logo, large & small |
| `/Achimowin_Logo.png` | Achimowin sub-brand logo |
| `/tcnsystemdiagram.png` | System architecture diagram |
| `/dataprivate.png` | Data privacy illustration |
| `/sittingonatv.png`, `/tcnmaletruck.png`, `/tcnfemalecouch.png`, `/tcngroup1.png` | Community member photo illustrations |
| `/centralmemberdb.png` | Database illustration |
| `/TCNbar_code.jpg` | Sample barcode ID |
| `/phoneappview.png`, `/barcodescanned.png` | App/scan illustrations |
| `/favicon-32x32.png` | Favicon |

---

## 8. Quick-reference CSS you can lift directly

```css
:root {
  --tcn-amber-900: #78350f;
  --tcn-amber-700: #b45309;
  --tcn-amber-600: #d97706;
  --tcn-amber-500: #f59e0b;
  --tcn-wood-border: #704f4f;
  --tcn-green: #529c67;
  --tcn-umber: #7b3306;
  --tcn-text-dark: rgba(25, 25, 25, 0.7);
  --tcn-text-light: rgba(250, 250, 250, 0.7);
  --tcn-highlight-yellow: rgba(251, 231, 77, 1);
  --tcn-radius: 0.625rem;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

.page-bg {
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

.top-nav {
  background-color: rgba(120, 53, 15, 0.95);
  backdrop-filter: blur(4px);
  border-bottom: 1px solid rgba(217, 119, 6, 0.5);
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
}

.section-divider {
  height: 5px;
  width: 100%;
  background-color: var(--tcn-amber-900);
  border-bottom: 1px solid rgba(217, 119, 6, 0.5);
  margin: 3rem 0;
}

.heading-chip {
  font-size: clamp(1.5rem, 0.607rem + 2.381vw, 2.75rem);
  font-weight: 600;
  padding: 1rem;
  background-color: var(--tcn-umber);
  color: rgba(250, 250, 250, 0.6);
}

.body-text {
  font-size: clamp(1.5rem, 0.964rem + 1.429vw, 2.25rem);
  font-weight: 500;
  color: var(--tcn-text-dark);
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(to right, var(--tcn-amber-700), var(--tcn-amber-600), var(--tcn-amber-700));
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
  padding: 1.25rem 2rem;
  border-radius: 0.75rem;
  border: 2px solid rgba(245, 158, 11, 0.5);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}
.cta-button:hover {
  background: linear-gradient(to right, var(--tcn-amber-600), var(--tcn-amber-500), var(--tcn-amber-600));
  transform: scale(1.05);
}

.card-panel {
  position: relative;
  overflow: hidden;
  background-color: rgba(197, 192, 192, 0.5);
  border-radius: 1rem;
  border: 4px solid var(--tcn-wood-border);
  box-shadow: 3px 10px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}
.card-panel:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
```
