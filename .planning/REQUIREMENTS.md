# Requirements: ASCII Cam

**Defined:** 2026-02-13
**Core Value:** Live webcam-to-ASCII rendering must work smoothly on mobile and desktop with brightness and motion signal extraction

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Webcam & Capture

- [ ] **CAM-01**: User can grant webcam permission with clear UI feedback and error recovery
- [ ] **CAM-02**: Video captures at low resolution (320x240) for mobile performance
- [ ] **CAM-03**: Processing pauses when browser tab is hidden (visibility API)
- [ ] **CAM-04**: User can toggle between front and rear cameras on mobile

### ASCII Rendering

- [ ] **ASCII-01**: Live webcam feed renders as ASCII characters mapped by pixel brightness
- [ ] **ASCII-02**: User can adjust ASCII resolution via slider (column count)
- [ ] **ASCII-03**: Rendering maintains 30+ fps on mobile devices
- [ ] **ASCII-04**: Green-on-black terminal aesthetic on dark background
- [ ] **ASCII-05**: User can select character set from dropdown (standard, dense, minimal)

### Motion & Brightness Analysis

- [ ] **ANLYS-01**: System extracts average brightness (0..1) from each frame
- [ ] **ANLYS-02**: System detects motion via frame-to-frame differencing (0..1)
- [ ] **ANLYS-03**: User can adjust motion sensitivity via slider

### UI & Layout

- [ ] **UI-01**: Mobile-first responsive layout using Bootstrap 5 grid
- [ ] **UI-02**: Dark theme with clean minimal aesthetic
- [ ] **UI-03**: Large main stage area for ASCII canvas output
- [ ] **UI-04**: Controls stacked vertically on mobile, row/grid on desktop
- [ ] **UI-05**: Footer note about HTTPS/GitHub Pages requirement

### Code Quality

- [ ] **CODE-01**: ES module architecture across separate files (main, renderer, analyzer, config)
- [ ] **CODE-02**: Thorough inline comments demonstrating HTML, CSS, Bootstrap, and JS knowledge
- [ ] **CODE-03**: Deployable as static site with no build step
- [ ] **CODE-04**: README.md with setup, features, and known limitations

## v2 Requirements

### Audio Synthesis

- **AUD-01**: Enable Audio button handling browser autoplay restrictions
- **AUD-02**: Mute toggle (disabled until audio enabled)
- **AUD-03**: Dreamy/ethereal pad synth using Tone.js
- **AUD-04**: Brightness maps to pitch (brighter = higher)
- **AUD-05**: Motion maps to volume and/or filter cutoff
- **AUD-06**: Reverb + lowpass filter for ambient atmosphere

## Out of Scope

| Feature | Reason |
|---------|--------|
| Video recording/export | High complexity, OS screen recording sufficient |
| User accounts/social sharing | Not needed for class project |
| Advanced motion detection (optical flow) | Frame differencing sufficient |
| MIDI controller support | Niche, high complexity |
| Mobile native app | Web only |
| React/Vue/frameworks | Vanilla JS required for class |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CODE-01 | Phase 1 | Pending |
| CODE-03 | Phase 1 | Pending |
| CODE-04 | Phase 1 | Pending |
| CAM-01 | Phase 2 | Pending |
| CAM-02 | Phase 2 | Pending |
| CAM-03 | Phase 2 | Pending |
| CAM-04 | Phase 2 | Pending |
| ASCII-01 | Phase 3 | Pending |
| ASCII-02 | Phase 3 | Pending |
| ASCII-03 | Phase 3 | Pending |
| ASCII-04 | Phase 3 | Pending |
| ASCII-05 | Phase 3 | Pending |
| ANLYS-01 | Phase 4 | Pending |
| ANLYS-02 | Phase 4 | Pending |
| ANLYS-03 | Phase 4 | Pending |
| UI-01 | Phase 5 | Pending |
| UI-02 | Phase 5 | Pending |
| UI-03 | Phase 5 | Pending |
| UI-04 | Phase 5 | Pending |
| UI-05 | Phase 5 | Pending |
| CODE-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-02-13 after roadmap creation*
