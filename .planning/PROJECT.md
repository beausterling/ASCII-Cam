# ASCII Cam

## What This Is

A mobile-first vanilla JavaScript web app that converts a live webcam feed into animated ASCII art, while generating a dreamy ambient soundscape driven by the video's brightness and motion. Built with p5.js for rendering and Tone.js for audio, deployable as a static site on GitHub Pages. This is a class project for a JavaScript web development programming course.

## Core Value

The live webcam-to-ASCII rendering must work smoothly on mobile and desktop, with brightness and motion signals driving an ambient audio experience -- all without any build tools or frameworks.

## Requirements

### Validated

(None yet -- ship to validate)

### Active

- [ ] Webcam capture and live ASCII art rendering using p5.js
- [ ] Brightness signal extraction from video feed (0..1)
- [ ] Motion signal extraction from frame-to-frame differences (0..1)
- [ ] Dreamy/ethereal ambient pad synth using Tone.js, driven by brightness (pitch) and motion (volume)
- [ ] Mobile-first responsive layout with Bootstrap 5
- [ ] Dark theme with classic green-on-black terminal aesthetic for ASCII output
- [ ] Enable Audio button to handle browser autoplay restrictions
- [ ] Mute toggle (disabled until audio enabled)
- [ ] ASCII Resolution slider
- [ ] Motion Sensitivity slider
- [ ] Character Set dropdown (standard, dense, minimal)
- [ ] ES module architecture across multiple files
- [ ] Deployable as a static site (no build step)
- [ ] Thorough inline comments demonstrating knowledge of HTML, CSS, Bootstrap, and JavaScript

### Out of Scope

- React, Vue, or any frontend framework -- vanilla JS only, class requirement
- Server-side processing -- must be fully client-side
- Mobile native app -- web only
- Video recording or screenshot capture -- live view only
- Multiple audio modes or user-selectable synth types -- single ambient pad

## Context

- This is a JavaScript web development programming class project
- Code must read as student-written: natural inline comments explaining concepts, demonstrating understanding of fundamentals
- All dependencies loaded via CDN (p5.js, Tone.js, Bootstrap 5)
- Must work on HTTPS (GitHub Pages) for webcam access
- Performance matters on mobile: modest ASCII grid defaults, audio parameter updates throttled to 10-20 Hz

## Constraints

- **Tech stack**: HTML5 + CSS + Bootstrap 5 + vanilla JS with ES modules, p5.js and Tone.js via CDN
- **No build tools**: Must work when opened as a static site
- **Browser APIs**: Webcam requires HTTPS; audio requires user gesture to start
- **Performance**: ASCII grid sized modestly by default; Tone.js parameters updated at ~10-20 Hz, not every frame
- **Code style**: Heavy inline commenting in a natural student voice

## Key Decisions

| Decision                          | Rationale                                                        | Outcome    |
| --------------------------------- | ---------------------------------------------------------------- | ---------- |
| p5.js for rendering               | Handles webcam capture and canvas drawing in one library         | -- Pending |
| Tone.js for audio                 | Mature Web Audio abstraction with built-in synths and effects    | -- Pending |
| Green-on-black terminal aesthetic | Classic retro hacker feel contrasts nicely with dreamy audio     | -- Pending |
| Dreamy/ethereal audio style       | Soft pads, reverb, slow evolving tones for calm ambient vibe     | -- Pending |
| ES modules with separate files    | Clean separation of concerns (renderer, analyzer, audio, config) | -- Pending |

---

_Last updated: 2026-02-13 after initialization_
