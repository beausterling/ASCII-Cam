# Phase 1: Foundation & Project Setup - Context

**Gathered:** 2026-02-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Deployable static site with ES module architecture ready for feature development. Includes project scaffolding, file structure, GitHub Pages deployment, and developer tooling. No camera or ASCII rendering functionality — just the foundation other phases build on.

</domain>

<decisions>
## Implementation Decisions

### Visual starting point

- Big ASCII text logo ("ASCII CAM" in large block letters, figlet-style) centered on page
- No tagline, no feature list — just the logo on a dark background
- Dark page background with neutral (white/gray) UI elements — green reserved for ASCII output only in later phases
- Animations deferred to a later phase — static logo for now

### Deployment setup

- GitHub Pages deployed directly from main branch root (no /docs folder, no Actions workflow)
- Repo: https://github.com/beausterling/ASCII-Cam
- Default GitHub Pages URL for now; custom domain to be configured later by user
- Repo exists but needs README.md and .gitignore created
- Feature branch workflow — develop on feature branches, merge to main to deploy

### Dev experience

- ESLint + Prettier set up for linting and auto-formatting
- 2-space indent, 80 character line length
- Libraries (p5.js, Bootstrap) loaded from CDN — no bundling

### Claude's Discretion

- Local development server choice (live-reload vs simple HTTP server)
- Whether to include a package.json (for dev scripts) or stay zero-dependency
- .gitignore contents
- ESLint/Prettier config details

</decisions>

<specifics>
## Specific Ideas

- ASCII logo should use large block letters (figlet/toilet style) — sets the terminal vibe immediately
- Page feel: dark with neutral controls, not full terminal-green everywhere

</specifics>

<deferred>
## Deferred Ideas

- Animated ASCII splash (blinking cursor, scrolling text) — revisit after core features land
- Custom domain setup — user will configure DNS later

</deferred>

---

_Phase: 01-foundation-project-setup_
_Context gathered: 2026-02-13_
