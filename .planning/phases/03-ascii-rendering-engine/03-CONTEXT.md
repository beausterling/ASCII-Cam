# Phase 3: ASCII Rendering Engine - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Live webcam feed converts to ASCII art at 30+ fps with terminal aesthetic. Users can adjust resolution via slider and select character sets from a dropdown. This phase delivers the core rendering pipeline — motion/brightness analysis and UI polish are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Character mapping

- Long character ramp (~12+ characters) for smooth tonal gradation
- Bright pixels map to dense characters (drawing with light — bright areas get @#, dark get spaces)
- Perceptual luminance weighting (0.299R + 0.587G + 0.114B) for natural-looking brightness conversion

### Character sets

- 3 sets: standard, dense, minimal (as specified in roadmap)
- Claude's discretion on specific characters for each set — must feel distinct from each other

### Resolution & grid sizing

- Slider range: 40–160 columns
- Default: 80 columns (classic terminal width)
- Real-time update while dragging, but prioritize mobile performance — throttle or debounce if needed to prevent jank/crashes
- Slider shows live label with current column count (e.g., "80 cols")

### Visual presentation

- Classic phosphor green (#00FF00 or similar) on black background
- ASCII output fills available screen space — font size adjusts so grid fits viewport
- Toggle switch (iOS-style) to switch between raw video feed and ASCII output

### Controls & interaction

- Controls placed below the ASCII output — output gets visual priority
- Resolution slider with live numeric label
- Character set dropdown
- Video/ASCII toggle switch
- FPS counter hidden by default — debug/console only

### Claude's Discretion

- Render method (HTML pre block vs canvas) — pick based on what hits 30fps on mobile
- Aspect ratio correction — pick based on what looks best with the chosen font
- Character set designs — 3 distinct sets with different visual feels
- Throttling/debounce strategy for real-time slider updates

</decisions>

<specifics>
## Specific Ideas

- "Fill screen" sizing — the ASCII art should feel immersive, filling the viewport
- Toggle between video and ASCII rather than side-by-side — keeps focus on one view at a time
- Classic phosphor green for authentic CRT/hacker aesthetic
- User wants real-time slider feedback but explicitly prioritizes mobile performance over smoothness

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 03-ascii-rendering-engine_
_Context gathered: 2026-02-14_
