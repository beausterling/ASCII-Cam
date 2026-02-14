# ASCII Cam

A real-time webcam-to-ASCII art web app built with vanilla JavaScript and p5.js.

## Features

- Figlet ASCII logo splash page
- ES module architecture (main, renderer, analyzer, config)
- Dark theme with Bootstrap 5
- Deployable as a static site (no build step required)

## Quick Start

1. Clone the repo
2. Start a local server (ES modules require HTTP, not file://):
   - **Option A (Python):** `python3 -m http.server 8000`
   - **Option B (Node.js):** `npx serve .`
3. Open `http://localhost:8000` in your browser

## Development

- `npm install` to set up ESLint and Prettier (optional dev tooling)
- `npm run lint` to check code style
- `npm run format` to auto-format all files
- `npm run dev` to start local development server

## Deployment

- Deployed via GitHub Pages from main branch
- HTTPS required for webcam access (provided by GitHub Pages)
- Push to main branch to deploy automatically

## Project Structure

```
ASCII-Cam/
├── index.html              # HTML entry point with CDN scripts and ES module entry
├── css/
│   └── style.css          # Custom dark theme styles
├── js/
│   ├── main.js            # ES module entry point, figlet logo initialization
│   ├── config.js          # Shared configuration exports
│   ├── renderer.js        # Renderer placeholder (will use p5.js in Phase 2)
│   └── analyzer.js        # Analyzer placeholder (brightness/ASCII mapping)
├── .nojekyll              # Disables GitHub Pages Jekyll processing
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## Tech Stack

- **p5.js** - Creative coding library (webcam capture + canvas rendering)
- **Bootstrap 5** - Responsive layout and dark theme
- **figlet.js** - ASCII text art generation
- **Vanilla JavaScript** with ES modules

## Known Limitations

- ES modules require a local HTTP server (cannot open index.html directly via file://)
- Webcam features require HTTPS (GitHub Pages or localhost)
- Currently a splash page only - webcam features coming in future phases
