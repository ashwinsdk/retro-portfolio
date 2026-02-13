# ASHWIN SDK — Brutalist Retro Portfolio

A single-product web application with a brutalist visual theme and retro-gaming aesthetic. Built as a mobile-first, fully responsive portfolio with PWA capabilities.

---

## Quick Start

```bash
# No build step required — plain HTML/CSS/JS
# Serve with any static server:
npx serve .
# Or:
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

---

## Project Structure

```
ashwinsdk/
├── index.html                  # Main app entry point
├── manifest.json               # PWA manifest
├── sw.js                       # Service worker
├── src/
│   ├── css/
│   │   ├── tokens.css          # Design tokens (CSS custom properties)
│   │   └── main.css            # Full stylesheet (mobile-first)
│   ├── js/
│   │   ├── motion.js           # Motion system helpers (stagger, easing)
│   │   ├── app.js              # Main app logic (nav, HUD, scroll, modal)
│   │   ├── carousel.js         # Horizontal snap carousel with 3D tilt
│   │   └── game.js             # Mini-game (Canvas, opt-in)
│   ├── tokens.json             # Design tokens (JSON export)
│   ├── content.json            # Localisable site content
│   ├── content-schema.json     # Content JSON schema
│   ├── casestudy-schema.json   # Case study data schema
│   └── assets/
│       ├── sprites/            # Sprite sheets for pixel art
│       ├── lottie/             # Lottie animation files
│       └── sounds/             # Short 8-bit sound effects (opt-in)
├── public/
│   ├── favicon.svg             # Favicon
│   ├── icon-192.png            # PWA icon 192x192
│   └── icon-512.png            # PWA icon 512x512
├── docs/
│   ├── motion-system.md        # Motion spec document
│   ├── microinteraction-catalogue.tsv  # Interaction spec spreadsheet
│   └── acceptance-criteria.md  # QA acceptance criteria
└── accessibility-test.html     # A11y test page (reduced motion + keyboard nav)
```

---

## Design Tokens

### CSS Custom Properties
Drop [`src/css/tokens.css`](src/css/tokens.css) into your project. Key variables:

```css
--neon: #00FF66;        /* Primary accent */
--ink: #000000;         /* Background */
--paper: #FFFFFF;       /* Text */
--border-w: 3px;        /* Default brutalist border */
--radius: 2px;          /* Near-square corners */
--font-mono: 'Source Code Pro', monospace;
--baseline: 8px;        /* Spacing grid */
```

### JSON Export
[`src/tokens.json`](src/tokens.json) — full token set for programmatic use, Figma plugins, or style-dictionary.

---

## Motion System

See [`docs/motion-system.md`](docs/motion-system.md) for the complete spec.

### Key Values
| Category          | Range          | Easing                          |
|-------------------|----------------|---------------------------------|
| Micro (hover/tap) | 80–150ms       | `cubic-bezier(.22,1,.36,1)`    |
| Small (card)      | 200–360ms      | `cubic-bezier(.22,1,.36,1)`    |
| Large (modal)     | 360–600ms      | `cubic-bezier(.2,.8,.2,1)`     |
| Stagger           | 60–90ms gap    | —                               |

### Performance Rules
- Only animate `transform` and `opacity`
- Use `will-change` sparingly, remove after animation
- Target 60fps; all within 16ms frame budget

### JS Helpers
```js
// Available globally as Motion.*
Motion.staggerReveal(elements, { delay: 80, duration: 250 });
Motion.sectionEntrance(element);
Motion.modalOpen(modalElement);
Motion.modalClose(modalElement);
Motion.animateSkillRing(svgCircle, percentValue);
Motion.typeText(element, 'SENDING...', { charDelay: 40 });
```

---

## Microinteraction Catalogue

See [`docs/microinteraction-catalogue.tsv`](docs/microinteraction-catalogue.tsv) for the full spreadsheet.

Each entry includes: Component, Trigger, Exit, Duration, Easing, Keyboard Trigger, Focus State, ARIA, and Reduced Motion fallback.

---

## Component Reference

### Navigation
- Desktop: floating left-aligned brutalist nav with neon underlines
- Mobile: hamburger with slide-down menu
- `aria-current="page"` on active link

### HUD (Settings Panel)
- Top-right fixed panel with toggles: Mode (retro/modern), Motion, Sound, Cursor, Contrast
- All settings stored in `data-*` attributes on `<html>`
- Respects `prefers-reduced-motion` system setting

### Hero / Game-Start
- Oversized monospace title with optional glitch effect
- "PRESS X TO START" CTA with pixel-scan hover
- Cartridge loader with frame animation

### Role Cards (About)
- Click/Enter/Space to flip (rotateY 450ms, preserve-3d)
- XP bar fills on viewport enter
- `aria-expanded` toggles front/back

### Skill Cards (Loadout)
- Staggered reveal (60ms gap)
- SVG ring meter animation (800ms on in-view)
- Click/focus for detail overlay

### Project Carousel (Level Select)
- Horizontal snap scroll (`scroll-snap-type: x mandatory`)
- Center card: full scale + neon border + 3D tilt
- Side cards: scale(0.92), opacity 0.6
- Arrow buttons + keyboard (←/→) navigation

### Case Study Modal
- Full-screen overlay with focus trap
- Populated programmatically from `caseStudies` data object
- Sections: header, problem, tech, design, architecture, challenges, results, playground, links
- ESC / backdrop click / close button to dismiss

### Contact Terminal
- Retro terminal styled form
- Typing animation on submit ("SENDING...")
- Social tiles as brutalist blocks

### Mini-Game (Playground)
- 30-second "Block Chain Collector" arcade game
- Canvas-based, sprite-style rendering
- Opt-in only (lazy-loaded)
- Arrow keys / touch to control
- Chain mechanic: collect 10 chain blocks for bonus

---

## Content & Localisation

- [`src/content.json`](src/content.json) — all site copy in structured JSON
- [`src/content-schema.json`](src/content-schema.json) — JSON schema for validation
- [`src/casestudy-schema.json`](src/casestudy-schema.json) — schema for case study data

To localize: duplicate `content.json`, translate values, and load the appropriate locale file in `app.js`.

---

## Accessibility Checklist

- [x] **Semantic HTML**: proper heading hierarchy, landmarks, lists
- [x] **Keyboard navigation**: all interactive elements focusable via Tab, operable with Enter/Space
- [x] **Focus visible**: white 2px outline on focused elements
- [x] **ARIA attributes**: `aria-expanded`, `aria-current`, `aria-live`, `role="dialog"`, `aria-modal`, `aria-hidden`
- [x] **Focus trap**: modal traps focus, returns on close
- [x] **Reduced motion**: respects `prefers-reduced-motion`; HUD toggle for manual control
- [x] **Color contrast**: body text (white on black) exceeds WCAG AAA; neon used for accents only
- [x] **Alt text**: all decorative elements marked `aria-hidden="true"`; meaningful images need alt text when added
- [x] **Form labels**: all inputs have visible `<label>` elements
- [x] **Skip link**: nav provides direct section links
- [x] **High-contrast mode**: toggleable via HUD

---

## Performance Checklist

- [x] **No build step**: vanilla HTML/CSS/JS, no bundler required
- [x] **CSS-only transitions**: where possible; Web Animations API for complex sequences
- [x] **Lazy-loaded game**: `game.js` deferred, game canvas hidden until opt-in
- [x] **Image optimization**: use AVIF/WebP for thumbnails when adding project screenshots
- [x] **Font loading**: Google Fonts with `display=swap` and preconnect
- [x] **Service worker**: cache-first for static assets, offline fallback
- [x] **Minimal JS**: no frameworks, no heavy libraries
- [ ] **Target**: main bundle < 250KB gzipped (currently well under with vanilla JS)
- [ ] **Lighthouse**: target ≥90 Performance, 100 Accessibility on mobile 3G

---

## Handoff Notes for Engineers

### Design Tokens
- CSS: import `src/css/tokens.css` — all values as custom properties
- JSON: `src/tokens.json` — for Figma/style-dictionary/programmatic use
- Both sources are the single source of truth; keep them in sync

### Markup Patterns
Reusable HTML patterns are in `index.html`:
- **Nav**: `.nav` block with `.nav__link` items
- **Hero**: `.section--hero` with `.hero__title`, `.hero__cta`
- **Card**: `.project-card` with `.project-card__preview`, `.project-card__info`
- **Carousel**: `.carousel` with `.carousel__track` containing cards
- **Modal**: `.modal` with `.modal__container`, populated by JS
- **Terminal form**: `.terminal` with `.terminal__line` rows

### Motion Module
`src/js/motion.js` exports:
- `Motion.EASING` / `Motion.DURATION` / `Motion.STAGGER` — constants
- `Motion.staggerReveal(elements, options)` — stagger grid items
- `Motion.sectionEntrance(el)` — fade+slide section in
- `Motion.modalOpen(el)` / `Motion.modalClose(el)` — modal transitions
- `Motion.animateSkillRing(svg, value)` — ring meter
- `Motion.typeText(el, text, options)` — terminal typing
- `Motion.checkReducedMotion()` — returns boolean

### Testing Motion via HUD
All motion can be toggled via the top-right HUD:
- **MODE**: switches retro ↔ modern (rounded corners, no scanlines)
- **MOTION**: disables all decorative animation
- **SOUND**: enables/disables 8-bit sound effects
- **CURSOR**: custom pixel crosshair cursor
- **CONTRAST**: high-contrast mode

### Accessibility Test Page
[`accessibility-test.html`](accessibility-test.html) demonstrates:
- Reduced-motion mode
- Keyboard navigation through all components
- Focus states and ARIA attributes
- High-contrast mode

---

## Browser Support

| Browser       | Version   |
|---------------|-----------|
| Chrome        | 90+       |
| Firefox       | 90+       |
| Safari        | 15+       |
| Edge          | 90+       |
| Mobile Safari | 15+       |
| Chrome Mobile | 90+       |

---

## License

© 2026 Ashwin Sudhakar. All rights reserved.
