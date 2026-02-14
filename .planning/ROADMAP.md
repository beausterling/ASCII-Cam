# Roadmap: ASCII Cam

## Overview

ASCII Cam delivers a live webcam-to-ASCII art web app in 5 phases, starting with project foundation and deployment scaffolding, then building up camera capture with mobile-optimized controls, core ASCII rendering at 30+ fps, motion/brightness analysis for future audio features, and finally a polished responsive UI with Bootstrap. Each phase delivers a complete, testable capability that builds toward the full mobile-first ASCII art experience.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Project Setup** - Static site scaffolding, ES modules, and deployment
- [x] **Phase 2: Webcam Capture** - Camera access, permissions, and mobile controls
- [ ] **Phase 3: ASCII Rendering Engine** - Live video-to-ASCII conversion at 30+ fps
- [ ] **Phase 4: Motion & Brightness Analysis** - Frame differencing and signal extraction
- [ ] **Phase 5: UI & Layout Polish** - Responsive Bootstrap interface and code quality

## Phase Details

### Phase 1: Foundation & Project Setup

**Goal**: Deployable static site with ES module architecture ready for feature development
**Depends on**: Nothing (first phase)
**Requirements**: CODE-01, CODE-03, CODE-04
**Success Criteria** (what must be TRUE):

1. Project runs as static site when opened in browser (no build step required)
2. ES modules load correctly across separate files (main, renderer, analyzer, config)
3. Site deploys successfully to GitHub Pages with HTTPS access
4. README.md documents setup instructions and project overview
   **Plans**: 2 plans

Plans:

- [x] 01-01-PLAN.md -- Project scaffolding with ES modules, figlet logo, and README
- [x] 01-02-PLAN.md -- Dev tooling (ESLint/Prettier) and browser verification

### Phase 2: Webcam Capture

**Goal**: Users can grant camera access and control webcam feed on mobile and desktop
**Depends on**: Phase 1
**Requirements**: CAM-01, CAM-02, CAM-03, CAM-04
**Success Criteria** (what must be TRUE):

1. User sees clear permission prompt and can grant webcam access
2. User receives helpful error messages if permission denied or camera unavailable
3. Video captures at low resolution (320x240) for mobile performance
4. User can toggle between front and rear cameras on mobile devices
5. Processing pauses automatically when browser tab is hidden
   **Plans**: 2 plans

Plans:

- [x] 02-01-PLAN.md -- Webcam module with camera init, switching, error handling, and UI controls
- [x] 02-02-PLAN.md -- p5.js sketch integration, visibility pause, and button handler wiring

### Phase 3: ASCII Rendering Engine

**Goal**: Live webcam feed converts to ASCII art at 30+ fps with terminal aesthetic
**Depends on**: Phase 2
**Requirements**: ASCII-01, ASCII-02, ASCII-03, ASCII-04, ASCII-05
**Success Criteria** (what must be TRUE):

1. Live webcam feed displays as ASCII characters mapped by pixel brightness
2. User can adjust ASCII resolution via slider (changes column count)
3. Rendering maintains 30+ fps on mobile devices
4. ASCII output displays green-on-black terminal aesthetic
5. User can select character set from dropdown (standard, dense, minimal)
   **Plans**: 2 plans

Plans:

- [ ] 03-01-PLAN.md -- Core ASCII rendering pipeline (pixel sampling, character mapping, green terminal display)
- [ ] 03-02-PLAN.md -- Interactive controls (resolution slider, character set dropdown, video/ASCII toggle)

### Phase 4: Motion & Brightness Analysis

**Goal**: System extracts brightness and motion signals from video frames
**Depends on**: Phase 3
**Requirements**: ANLYS-01, ANLYS-02, ANLYS-03
**Success Criteria** (what must be TRUE):

1. System calculates average brightness (0..1 scale) from each frame
2. System detects motion intensity via frame-to-frame differencing (0..1 scale)
3. User can adjust motion sensitivity via slider
4. Analysis runs efficiently without impacting rendering performance
   **Plans**: TBD

Plans:

- [ ] 04-01: [TBD]

### Phase 5: UI & Layout Polish

**Goal**: Professional mobile-first responsive interface with thorough documentation
**Depends on**: Phase 4
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, CODE-02
**Success Criteria** (what must be TRUE):

1. Layout responds gracefully from mobile to desktop using Bootstrap 5 grid
2. Interface uses dark theme with clean minimal aesthetic
3. Main stage area prominently displays ASCII canvas output
4. Controls stack vertically on mobile, arrange in row/grid on desktop
5. Footer notes HTTPS requirement for GitHub Pages deployment
6. Code contains thorough inline comments demonstrating HTML, CSS, Bootstrap, and JavaScript knowledge
   **Plans**: TBD

Plans:

- [ ] 05-01: [TBD]

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase                           | Plans Complete | Status      | Completed  |
| ------------------------------- | -------------- | ----------- | ---------- |
| 1. Foundation & Project Setup   | 2/2            | Complete    | 2026-02-14 |
| 2. Webcam Capture               | 2/2            | Complete    | 2026-02-14 |
| 3. ASCII Rendering Engine       | 0/2            | Not started | -          |
| 4. Motion & Brightness Analysis | 0/TBD          | Not started | -          |
| 5. UI & Layout Polish           | 0/TBD          | Not started | -          |

---

_Roadmap created: 2026-02-13_
_Last updated: 2026-02-14_
