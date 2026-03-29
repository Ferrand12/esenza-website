# Esenza | Natural Wellness Stay

## Project
- **Stack**: Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript
- **Type**: Single-page marketing site for a wellness eco-lodge in Cundinamarca, Colombia
- **Language**: Spanish (es_CO)

## Architecture
- All components in `src/components/` — no subdirectories except `ui/`
- Single page at `src/app/page.tsx` importing all section components
- Material Design 3 color tokens in `src/app/globals.css`
- Fonts: Cormorant Garamond (editorial), Plus Jakarta Sans (body), Great Vibes (script), Noto Serif (headline)
- Material Symbols Outlined loaded via Google Fonts CDN in layout.tsx

## Design System (Material Design 3)
- Primary: `#002814` / Primary Container: `#014023`
- Secondary: `#6f5d16` / Secondary Container: `#fbe18d`
- Surface tokens for backgrounds: `surface`, `surface-container-low`, `surface-bright`
- Use `font-editorial` for headings, `font-label` for nav/buttons, `font-script` for decorative
- Icons: use `<span className="material-symbols-outlined">icon_name</span>`
- Cards hover: `hover:bg-primary-container` with text switching to white

## Conventions
- All interactive components use `"use client"` directive
- IntersectionObserver pattern for scroll-triggered animations
- WhatsApp as primary CTA (placeholder: +57 300 123 4567)
- Tailwind classes only — no CSS modules, no styled-components
- No `next/image` yet — using `<img>` tags (migration pending)

## Skills
- After writing/modifying code, auto-run `/simplify` to review for quality
- Use parallel agents for multi-file edits

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — ESLint check
