# Aventrixx

A cinematic, responsive creative technology studio website built with native JavaScript modules, CSS, SVG, canvas, and a small Node.js server. The visual direction is inspired by Trae's public website, with original Aventrixx content and interfaces. No installation or build step is required.

## Run

```sh
npm run dev
```

Open http://localhost:3000. `PORT` and `HOST` can be configured. `npm start` runs the production server.

The current preview is at http://localhost:3001 (`PORT=3001 npm run dev`). Source JavaScript and CSS are served without caching so normal reloads pick up edits. Fonts and images retain their asset cache.

## Validation

```sh
npm run check
npm test
```

`npm test` exercises the server request handler in-process and checks page structure and internal links. Browser checks use Playwright with a local Chrome installation:

```sh
npm install --prefix /tmp/aventrixx-browser playwright --no-audit --no-fund
PLAYWRIGHT_PATH=/tmp/aventrixx-browser/node_modules/playwright npm run test:browser
```

The browser suite starts an isolated server, writes test inquiries into a temporary directory, checks every page at five widths, and cleans up its records. Set `CHROME_PATH` if Chrome is installed elsewhere. Screenshots are saved under `artifacts/`.

## Features

- 22 responsive pages: home, six individual services, capability index, concept portfolio and three project pages, solutions, engagements, insights and three articles, about, contact, privacy, and terms. Unknown URLs display a 404.
- A near-black and electric-green design system, large editorial typography, square cards, compact persistent navigation, and original growth workspace mockups.
- A continuously morphing pixel landscape: dense gray and green islands gather, flow, and dissolve without pointer input. Desktop pointer lighting is optional. Canvas rendering is capped at 30 frames per second on desktop and 24 on mobile, pauses offscreen and in hidden tabs, and becomes static with reduced motion.
- A keyboard-accessible numbered feature showcase, scroll-linked capability depth, native mobile swipe carousel, once-only reveals, and reduced-motion alternatives.
- An interactive experience showcase with a keyboard-accessible before-and-after design slider, market-intelligence scene, and AI workflow scene.
- Scroll-driven editorial typography, pointer-responsive portfolio lighting, gentle CTA attraction, and a page progress indicator. Continuous effects pause outside the viewport.
- Keyboard-operable process stages and AI workflow nodes, visible focus states, mobile navigation focus management, and a skip link.
- Every dashboard and portfolio example is labeled as illustrative or conceptual.
- Direct URLs and browser history work through the Node server's route handling.
- Solutions explain connected services; engagement cards describe discovery-based scopes without invented prices; insights include article navigation. FAQs use native keyboard-operable disclosure controls.

Reference coverage and page-family adaptations are documented in [design-reference/README.md](design-reference/README.md). See [VERIFICATION.md](VERIFICATION.md) for completed checks and their limits.

## Inquiry handling

The form posts to `/api/inquiries`. A success message appears only after a record is durably written. Inquiries are stored as individual JSON files in `.data/inquiries/` with restrictive permissions. Set `INQUIRY_DATA_DIR` to an absolute persistent directory in production. Files are not publicly served. Inquiries older than 12 months are removed on the next submission. The server validates input, requires consent, checks the honeypot, restricts request origins, and limits submissions per network address.

**Delivery:** the app stores inquiries on its server. It does not send email or integrate with a CRM. The operator needs to review the private inquiry directory or connect an approved delivery integration. Use persistent storage, HTTPS, and access controls when deploying. Rate limiting uses the direct socket address; configure a trusted reverse-proxy strategy if operating behind a proxy.

Inter is served locally as a 48 KB variable WOFF2 font; its SIL Open Font License is included in `public/fonts/Inter-OFL.txt`. The earlier Space Grotesk asset and its license remain in `public/fonts/`. The site has no advertising cookies, analytics, externally loaded fonts, fabricated client results, or unconfigured social and newsletter links. Update company contact information and have the legal pages reviewed before public launch.
