# Phase 1: Foundation & Project Setup - Research

**Researched:** 2026-02-13
**Domain:** Static site deployment with ES modules, GitHub Pages, p5.js, and development tooling
**Confidence:** HIGH

## Summary

Phase 1 establishes a deployable static HTML/CSS/JavaScript site with ES module architecture on GitHub Pages. The project will use p5.js and Bootstrap from CDN (no bundling), ESLint/Prettier for code quality, and requires a local development server due to ES modules' CORS requirements. The visual centerpiece is a figlet-style ASCII logo ("ASCII CAM") on a dark background with neutral controls.

Key technical constraints: ES modules cannot run from `file://` protocol and require CORS headers, GitHub Pages needs `.nojekyll` to prevent Jekyll processing, and static imports must use file extensions explicitly. The stack is intentionally minimal with zero runtime dependencies and optional dev tooling.

**Primary recommendation:** Use a lightweight local dev server (Python's http.server or npx serve), keep package.json minimal for dev scripts only, load all libraries from CDN, and create `.nojekyll` file immediately to prevent GitHub Pages Jekyll issues.

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Visual starting point:**

- Big ASCII text logo ("ASCII CAM" in large block letters, figlet-style) centered on page
- No tagline, no feature list — just the logo on a dark background
- Dark page background with neutral (white/gray) UI elements — green reserved for ASCII output only in later phases
- Animations deferred to a later phase — static logo for now

**Deployment setup:**

- GitHub Pages deployed directly from main branch root (no /docs folder, no Actions workflow)
- Repo: https://github.com/beausterling/ASCII-Cam
- Default GitHub Pages URL for now; custom domain to be configured later by user
- Repo exists but needs README.md and .gitignore created
- Feature branch workflow — develop on feature branches, merge to main to deploy

**Dev experience:**

- ESLint + Prettier set up for linting and auto-formatting
- 2-space indent, 80 character line length
- Libraries (p5.js, Bootstrap) loaded from CDN — no bundling

### Claude's Discretion

- Local development server choice (live-reload vs simple HTTP server)
- Whether to include a package.json (for dev scripts) or stay zero-dependency
- .gitignore contents
- ESLint/Prettier config details

### Deferred Ideas (OUT OF SCOPE)

- Animated ASCII splash (blinking cursor, scrolling text) — revisit after core features land
- Custom domain setup — user will configure DNS later
  </user_constraints>

---

## Standard Stack

### Core

| Library   | Version | Purpose              | Why Standard                                                                                                              |
| --------- | ------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| p5.js     | 2.2.0+  | Rendering framework  | Industry-standard creative coding library with simple canvas API, webcam support built-in, and excellent CDN availability |
| Bootstrap | 5.3.8+  | UI framework         | Native dark mode support via `data-bs-theme`, CSS-only (no JS required), mature grid/utility system                       |
| figlet.js | 1.10.0+ | ASCII art generation | Official FIGlet implementation for JavaScript, browser-compatible, extensive font library                                 |

**CDN URLs:**

```html
<!-- p5.js -->
<script src="https://cdn.jsdelivr.net/npm/p5@2.2.0/lib/p5.min.js"></script>

<!-- Bootstrap CSS only -->
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
  rel="stylesheet"
/>

<!-- figlet.js -->
<script src="https://cdn.jsdelivr.net/npm/figlet@1.10.0/lib/figlet.min.js"></script>
```

### Supporting (Dev-only)

| Library                | Version | Purpose                     | When to Use                                                     |
| ---------------------- | ------- | --------------------------- | --------------------------------------------------------------- |
| ESLint                 | 9.x     | JavaScript linting          | Installed via npm as devDependency if package.json exists       |
| Prettier               | 3.x     | Code formatting             | Installed via npm as devDependency if package.json exists       |
| eslint-config-prettier | Latest  | ESLint/Prettier integration | Prevents ESLint formatting rules from conflicting with Prettier |

**Installation (if using package.json):**

```bash
npm install --save-dev eslint prettier eslint-config-prettier
```

### Alternatives Considered

| Instead of         | Could Use          | Tradeoff                                               |
| ------------------ | ------------------ | ------------------------------------------------------ |
| p5.js              | Vanilla Canvas API | More verbose, no webcam helpers, but zero dependencies |
| Bootstrap          | Custom CSS         | Full control, smaller bundle, but slower development   |
| figlet.js CDN      | Inline ASCII art   | No runtime load, but harder to change logo later       |
| Python http.server | live-server (Node) | Live reload vs. zero install                           |
| package.json       | No package.json    | Dev scripts vs. truly zero-dependency                  |

---

## Architecture Patterns

### Recommended Project Structure

```
ASCII-Cam/
├── index.html              # Entry point, loads CDN scripts
├── js/
│   ├── main.js            # ES module entry, initializes app
│   ├── renderer.js        # p5.js sketch (placeholder for Phase 2+)
│   ├── analyzer.js        # ASCII conversion logic (placeholder)
│   └── config.js          # Settings, character maps (placeholder)
├── css/
│   └── style.css          # Custom styles, dark theme overrides
├── fonts/                 # figlet.js font files (if self-hosted)
├── .gitignore             # Ignore node_modules, .env, editor files
├── .nojekyll              # CRITICAL: Disables GitHub Pages Jekyll
├── .eslintrc.json         # ESLint config (if using package.json)
├── .prettierrc            # Prettier config (if using package.json)
├── package.json           # OPTIONAL: Dev scripts only
└── README.md              # Setup, features, limitations
```

### Pattern 1: ES Module Entry Point (main.js)

**What:** Top-level module that imports and initializes other modules
**When to use:** Always — required for ES module architecture
**Example:**

```javascript
// main.js
import { initRenderer } from './renderer.js';
import { config } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('ASCII Cam initialized');
  // Future: initRenderer();
});
```

### Pattern 2: ES Module Static Imports

**What:** Import/export syntax for modular code
**When to use:** All cross-file dependencies
**Key requirements:**

- File extensions MUST be explicit (`.js` not omitted)
- Imports MUST be at top-level (not inside conditionals)
- Requires HTTP server (CORS prevents `file://` protocol)

**Example:**

```javascript
// config.js
export const config = {
  charSet: '@%#*+=-:. ',
  resolution: 8,
};

// analyzer.js
import { config } from './config.js'; // ← .js extension required

export function analyze(pixels) {
  return config.charSet[0]; // placeholder
}
```

**Source:** [MDN import documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), [ES modules guide](https://exploringjs.com/es6/ch_modules.html)

### Pattern 3: p5.js Instance Mode (Future-Ready)

**What:** Namespace p5.js to avoid global pollution
**When to use:** When integrating p5.js with other frameworks
**Example:**

```javascript
// renderer.js
export function initRenderer(container) {
  new p5((sketch) => {
    sketch.setup = () => {
      sketch.createCanvas(640, 480);
    };

    sketch.draw = () => {
      sketch.background(0);
    };
  }, container);
}
```

**Source:** [p5.js instance mode](https://github.com/processing/p5.js/wiki/Global-and-instance-mode)

### Pattern 4: figlet.js Static Logo Generation

**What:** Pre-generate ASCII logo on page load
**When to use:** Phase 1 static logo (before camera features)
**Example:**

```javascript
// main.js
figlet.defaults({
  fontPath: 'https://cdn.jsdelivr.net/npm/figlet@1.10.0/fonts/',
});

figlet('ASCII CAM', { font: 'Standard' }, (err, text) => {
  if (err) {
    console.error('Figlet error:', err);
    return;
  }
  document.getElementById('logo').textContent = text;
});
```

**Source:** [figlet.js browser usage](https://github.com/patorjk/figlet.js/blob/main/README.md)

### Pattern 5: Bootstrap Dark Mode (CSS-Only)

**What:** Enable dark theme with HTML attribute
**When to use:** Always (per user constraints)
**Example:**

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
  <head>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
  </head>
  <body class="bg-dark text-white">
    <!-- Neutral UI elements, green reserved for later -->
  </body>
</html>
```

**Source:** [Bootstrap color modes](https://getbootstrap.com/docs/5.3/customize/color-modes/)

### Anti-Patterns to Avoid

- **Omitting file extensions in imports:** Breaks ES modules (`import x from './file'` → `import x from './file.js'`)
- **Using `file://` protocol:** CORS blocks ES modules; always use http://localhost
- **Forgetting `.nojekyll`:** GitHub Pages runs Jekyll by default, removing `_`-prefixed folders
- **Case-insensitive file names:** `Index.html` ≠ `index.html` on GitHub Pages servers
- **Loading p5.js as ES module:** p5.js is a UMD library; load via `<script>`, not `import`

---

## Don't Hand-Roll

| Problem          | Don't Build              | Use Instead                         | Why                                                                                    |
| ---------------- | ------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------- |
| ASCII text logos | Manual ASCII art in HTML | figlet.js library                   | 500+ fonts, horizontal/vertical layout options, edge case handling for character width |
| Dark theme       | Custom CSS variables     | Bootstrap `data-bs-theme="dark"`    | Pre-tested color contrast, accessibility compliance, component coverage                |
| Code formatting  | Manual style guide       | Prettier with `.prettierrc`         | Deterministic, zero-config, handles edge cases (ternaries, long chains)                |
| Linting rules    | Custom regex checks      | ESLint with recommended config      | AST-based analysis, catches real bugs (unused vars, missing returns)                   |
| Local dev server | Custom Node HTTP server  | Python `http.server` or `npx serve` | MIME types, CORS headers, directory listing, zero setup                                |

**Key insight:** Static site foundations have solved problems (CORS, Jekyll, formatting). Use proven solutions to avoid rewriting common edge case handling.

---

## Common Pitfalls

### Pitfall 1: ES Modules Fail with `file://` Protocol

**What goes wrong:** Opening `index.html` directly in browser shows "CORS policy" errors when loading modules
**Why it happens:** ES modules enforce CORS security; `file://` URLs are considered different origins even within same directory
**How to avoid:** Always develop with a local HTTP server
**Warning signs:** Browser console shows "Access to script at 'file://...' from origin 'null' has been blocked by CORS policy"

**Prevention:**

```bash
# Python (pre-installed on macOS/Linux)
python -m http.server 8000

# Node.js npx (requires Node installed)
npx serve .

# Navigate to: http://localhost:8000
```

**Sources:** [ES modules CORS requirement](https://medium.com/ghostcoder/using-es6-modules-in-the-browser-5dce9ca9e911), [WHATWG HTML issue #1888](https://github.com/whatwg/html/issues/1888)

### Pitfall 2: GitHub Pages 404 on Correct Files

**What goes wrong:** Deployed site shows 404 errors for files that exist in repo
**Why it happens:** GitHub Pages runs Jekyll by default, which deletes files/folders starting with `_` or `.` (except `.nojekyll`)
**How to avoid:** Add empty `.nojekyll` file to repository root
**Warning signs:** Site works locally but deployment shows missing assets, no CSS/JS loaded

**Prevention:**

```bash
touch .nojekyll
git add .nojekyll
git commit -m "disable Jekyll processing"
```

**Sources:** [GitHub Pages troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites), [Community discussion](https://github.com/orgs/community/discussions/61073)

### Pitfall 3: Case-Sensitive File Names on GitHub Pages

**What goes wrong:** `Index.html` or `INDEX.html` returns 404; site works locally (macOS/Windows)
**Why it happens:** GitHub Pages servers are Linux-based (case-sensitive); local dev often uses case-insensitive filesystems
**How to avoid:** Always use lowercase `index.html` and verify exact filename matches in import paths
**Warning signs:** Site works locally but fails after deployment

**Prevention:**

- Use `index.html` (all lowercase)
- Import paths must match exact case: `import { x } from './Config.js'` fails if file is `config.js`

### Pitfall 4: ESLint/Prettier Conflicts

**What goes wrong:** ESLint auto-fix reformats code, Prettier reformats it differently, infinite loop in CI
**Why it happens:** ESLint has formatting rules that overlap with Prettier
**How to avoid:** Install `eslint-config-prettier` to disable conflicting ESLint rules
**Warning signs:** Code changes on every save, CI formatting checks never pass

**Prevention:**

```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "prettier"],
  "rules": {
    "indent": ["error", 2],
    "max-len": "off" // Let Prettier handle line length
  }
}
```

**Source:** [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)

### Pitfall 5: figlet.js Font Loading from CDN

**What goes wrong:** `figlet()` fails silently or shows errors in console about missing fonts
**Why it happens:** Default font path points to local `/fonts` directory; CDN doesn't serve fonts from same path
**How to avoid:** Set `figlet.defaults({ fontPath: 'CDN_URL/fonts/' })` before calling `figlet()`
**Warning signs:** Console shows 404 errors for `.flf` files

**Prevention:**

```javascript
figlet.defaults({
  fontPath: 'https://cdn.jsdelivr.net/npm/figlet@1.10.0/fonts/',
});

figlet('ASCII CAM', { font: 'Standard' }, (err, text) => {
  if (err) {
    console.error('Figlet error:', err);
    return;
  }
  document.getElementById('logo').textContent = text;
});
```

**Source:** [figlet.js browser examples](https://github.com/patorjk/figlet.js/blob/main/examples/front-end/index.htm)

### Pitfall 6: Missing `.js` Extension in Imports

**What goes wrong:** `import { config } from './config'` throws "Failed to resolve module specifier"
**Why it happens:** Browsers require explicit file extensions for ES modules (unlike Node.js/bundlers)
**How to avoid:** Always include `.js` extension in relative imports
**Warning signs:** Browser console shows "Failed to resolve module specifier" or "404 Not Found" for modules

**Prevention:**

```javascript
// ✗ Wrong
import { config } from './config';

// ✓ Correct
import { config } from './config.js';
```

**Source:** [ES modules best practices](https://medium.com/@robinviktorsson/typescript-and-es-modules-best-practices-for-imports-and-exports-9ce200e75a88)

---

## Code Examples

Verified patterns from official sources:

### Minimal HTML Entry Point

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ASCII Cam</title>

    <!-- Bootstrap CSS (dark theme via data-bs-theme) -->
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />

    <!-- Custom styles -->
    <link rel="stylesheet" href="css/style.css" />

    <!-- CDN Libraries (loaded before ES modules) -->
    <script src="https://cdn.jsdelivr.net/npm/p5@2.2.0/lib/p5.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/figlet@1.10.0/lib/figlet.min.js"></script>
  </head>
  <body class="bg-dark text-white">
    <div id="app" class="container">
      <pre id="logo" class="text-center"></pre>
    </div>

    <!-- ES Module entry point -->
    <script type="module" src="js/main.js"></script>
  </body>
</html>
```

**Source:** [Bootstrap dark mode](https://getbootstrap.com/docs/5.3/customize/color-modes/), [figlet.js browser usage](https://github.com/patorjk/figlet.js)

### ES Module Structure (main.js)

```javascript
// js/main.js
import { config } from './config.js';
import { initRenderer } from './renderer.js';

// Configure figlet font path for CDN
figlet.defaults({
  fontPath: 'https://cdn.jsdelivr.net/npm/figlet@1.10.0/fonts/',
});

// Generate ASCII logo on load
document.addEventListener('DOMContentLoaded', () => {
  figlet('ASCII CAM', { font: 'Standard' }, (err, text) => {
    if (err) {
      console.error('Figlet failed:', err);
      document.getElementById('logo').textContent = 'ASCII CAM';
      return;
    }
    document.getElementById('logo').textContent = text;
  });

  // Future: initRenderer() when Phase 2 adds camera
  console.log('ASCII Cam initialized with config:', config);
});
```

**Source:** [figlet.js API](https://github.com/patorjk/figlet.js/blob/main/README.md)

### Config Module Pattern

```javascript
// js/config.js
export const config = {
  charSet: '@%#*+=-:. ',
  resolution: 8,
  theme: {
    background: '#000000',
    text: '#00ff00', // Green reserved for ASCII output
  },
};
```

**Source:** [ES modules static exports](https://exploringjs.com/es6/ch_modules.html)

### Placeholder Modules (renderer.js, analyzer.js)

```javascript
// js/renderer.js
export function initRenderer() {
  console.log('Renderer placeholder - will use p5.js in Phase 2');
}

// js/analyzer.js
import { config } from './config.js';

export function analyze(pixels) {
  console.log('Analyzer placeholder - will process pixels in Phase 2');
  return config.charSet[0];
}
```

### .gitignore for Static Site with Dev Tools

```gitignore
# Dependencies (if using package.json)
node_modules/

# Environment files
.env
.env.local
.env.*.local

# Editor directories
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# OS files
.DS_Store
Thumbs.db
*~
*.swp
*.swo

# Logs
*.log
npm-debug.log*
yarn-debug.log*

# Optional: Build artifacts (future phases)
dist/
build/
```

**Source:** [GitHub gitignore templates](https://github.com/github/gitignore), [JavaScript .gitignore best practices](https://clubmate.fi/example-gitignore-file)

### ESLint Configuration (.eslintrc.json)

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": ["eslint:recommended", "prettier"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "max-len": "off",
    "no-console": "off",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  },
  "globals": {
    "p5": "readonly",
    "figlet": "readonly"
  }
}
```

**Source:** [ESLint rules](https://eslint.org/docs/latest/rules/), [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier)

### Prettier Configuration (.prettierrc)

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

**Source:** [Prettier options](https://prettier.io/docs/options.html)

### Optional package.json (Dev Scripts Only)

```json
{
  "name": "ascii-cam",
  "version": "1.0.0",
  "description": "Real-time ASCII art webcam filter",
  "type": "module",
  "scripts": {
    "dev": "python -m http.server 8000",
    "lint": "eslint js/**/*.js",
    "lint:fix": "eslint js/**/*.js --fix",
    "format": "prettier --write \"**/*.{js,css,html,md}\"",
    "format:check": "prettier --check \"**/*.{js,css,html,md}\""
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.0.0"
  },
  "private": true
}
```

**Note:** `"type": "module"` sets default module system (for Node scripts if added later)
**Source:** [package.json best practices](https://medium.com/deno-the-complete-reference/package-json-best-practices-in-node-js-6b5f4f8728e9)

---

## State of the Art

| Old Approach                         | Current Approach               | When Changed                      | Impact                                                |
| ------------------------------------ | ------------------------------ | --------------------------------- | ----------------------------------------------------- |
| CommonJS (`require/module.exports`)  | ES Modules (`import/export`)   | ES2015 (wide support 2020+)       | Native browser support, static analysis, tree-shaking |
| Bootstrap 4 dark themes (custom CSS) | Bootstrap 5.3+ `data-bs-theme` | Bootstrap 5.3.0 (May 2023)        | CSS-only dark mode, no JavaScript required            |
| jQuery + manual DOM                  | Vanilla JS + ES modules        | ~2018 (IE11 EOL)                  | Smaller bundle, modern syntax, better performance     |
| Jekyll-based GitHub Pages            | Static HTML with `.nojekyll`   | Always supported, more common now | Skip Ruby build step, instant deploys                 |
| Bundlers required for modules        | Native ES modules in browsers  | ~2018 (ES2015+ support)           | Zero build step for development                       |

**Deprecated/outdated:**

- **Global p5.js mode for libraries:** Instance mode preferred to avoid namespace pollution
- **Python 2 `SimpleHTTPServer`:** Use Python 3 `http.server` (Python 2 EOL 2020)
- **@latest CDN tags in production:** Pin specific versions to prevent breaking changes
- **ESLint formatting rules with Prettier:** Use `eslint-config-prettier` to disable conflicts

---

## Open Questions

### 1. Package.json: Include or Skip?

**What we know:**

- User constraint allows Claude's discretion
- Dev scripts (`npm run format`, `npm run lint`) convenient but not required
- Zero dependencies at runtime (all libs from CDN)

**What's unclear:**

- User's preference for npm workflow vs. truly zero-dependency
- Whether CI/CD will be added in later phases (would benefit from scripts)

**Recommendation:**
Include minimal `package.json` with dev scripts for ESLint/Prettier. Benefits:

- Standardizes formatting across contributors
- Enables `npm run dev` for consistent server command
- Low cost (devDependencies not deployed)
- Can remove later if unused

### 2. Local Dev Server: Python vs. Node vs. None?

**What we know:**

- Python `http.server` pre-installed on macOS/Linux, zero setup
- `npx serve` requires Node.js, adds live-reload
- User constraint allows Claude's discretion

**What's unclear:**

- User's existing toolchain (Node.js installed?)
- Preference for live-reload vs. simplicity

**Recommendation:**
Document both options in README:

- **Default:** Python `http.server` (guaranteed to work)
- **Alternative:** `npx serve .` (if Node installed, want live-reload)
- **package.json script:** `"dev": "python -m http.server 8000"` (explicit, cross-platform)

### 3. figlet.js: CDN vs. Self-Hosted Fonts?

**What we know:**

- figlet.js library loaded from CDN
- Default font path points to local `/fonts` directory
- Must configure `fontPath` to CDN or download fonts

**What's unclear:**

- Network reliability requirements (offline capability?)
- Number of fonts needed (Standard font sufficient for Phase 1)

**Recommendation:**
Use CDN font path for Phase 1 (single Standard font):

```javascript
figlet.defaults({
  fontPath: 'https://cdn.jsdelivr.net/npm/figlet@1.10.0/fonts/',
});
```

Pros: Zero files to manage, automatic updates
Cons: Requires internet (acceptable for web app)

---

## Sources

### Primary (HIGH confidence)

- [p5.js library docs (Context7)](/processing/p5.js) - API patterns, setup/draw lifecycle
- [figlet.js library docs (Context7)](/patorjk/figlet.js) - Browser usage, font loading, CDN setup
- [GitHub Pages configuration docs](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) - Publishing from main branch
- [Bootstrap 5.3 color modes](https://getbootstrap.com/docs/5.3/customize/color-modes/) - Dark theme via `data-bs-theme`
- [MDN ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) - Import syntax, browser requirements
- [Prettier options](https://prettier.io/docs/options.html) - Configuration reference
- [ESLint rules](https://eslint.org/docs/latest/rules/indent) - Indent rule, config format

### Secondary (MEDIUM confidence)

- [GitHub Pages 404 troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites) - .nojekyll requirement, case sensitivity
- [ES modules CORS requirements (Jake Archibald)](https://jakearchibald.com/2017/es-modules-in-browsers/) - CORS policy, file:// protocol limitation
- [Prettier + ESLint 2026 guide (Medium)](https://medium.com/@osmion/prettier-eslint-configuration-that-actually-works-without-the-headaches-a8506b710d21) - Integration best practices
- [TypeScript ES modules best practices (Medium)](https://medium.com/@robinviktorsson/typescript-and-es-modules-best-practices-for-imports-and-exports-9ce200e75a88) - File extension requirement
- [package.json best practices (Tech Tonic)](https://medium.com/deno-the-complete-reference/package-json-best-practices-in-node-js-6b5f4f8728e9) - Scripts, dependencies organization

### Tertiary (LOW confidence - verify during implementation)

- [live-server GitHub](https://github.com/tapio/live-server) - Live-reload features
- [GitHub gitignore templates](https://github.com/github/gitignore) - Common patterns

---

## Metadata

**Confidence breakdown:**

- **Standard stack:** HIGH - p5.js, Bootstrap, figlet.js all verified via Context7 and official docs
- **Architecture:** HIGH - ES modules, GitHub Pages requirements verified with official sources
- **Pitfalls:** HIGH - CORS, Jekyll, case-sensitivity documented in GitHub official troubleshooting
- **Dev tooling:** MEDIUM - ESLint/Prettier integration well-documented but rapid evolution

**Research date:** 2026-02-13
**Valid until:** ~2026-03-13 (30 days - stable ecosystem)

**Key dependencies tracked:**

- p5.js: 2.2.0 (check for 2.3.x in 1-2 months)
- Bootstrap: 5.3.8 (stable minor versions)
- figlet.js: 1.10.0 (infrequent updates)
- ESLint/Prettier: Fast-moving, verify latest compatible versions at install time
