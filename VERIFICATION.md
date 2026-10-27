# Verification

Verified in Chrome on October 21, 2026:

- All 22 defined pages render at 360, 390, 768, 1024, and 1440 pixels without horizontal page overflow. The 404 state is also covered by the structural tests.
- The numbered feature tabs respond to clicks, arrow keys, Home, and End, maintaining selected panels, accessible selection, and keyboard focus. Solutions and engagements FAQs expand and collapse with the keyboard. Article anchors, browser back, and active-page navigation work.
- The before-and-after slider responds to pointer input and keyboard Home/End keys. All three experience scenes update their content, accessible selection state, and service links.
- The pinned capability showcase reaches the final panel, displays its controls within the viewport, and supports previous/next navigation. Small and short screens use the native carousel.
- Process keyboard selection, AI agent controls, desktop dropdown, mobile menu, Escape, browser back, direct service URLs, and refresh work.
- The pixel landscape keeps evolving without pointer input beyond the hero entrance and pauses offscreen. Reduced-motion mode keeps a static field; changing the preference restores motion. It also removes the pinned track and perspective transitions while preserving interactive controls and content.
- A real form submission writes one inquiry to isolated temporary storage. A simulated server failure displays an error without a false success. Test records are removed afterward.
- No uncaught browser errors occurred during these checks.
- Automated WCAG A/AA checks with axe found no violations on all 22 redesigned pages at 1440px with reduced motion enabled. The results are saved in `artifacts/accessibility-report.json`.
- JavaScript syntax, six structural/server test groups, and CSS selector parsing pass.
- The preview at `http://localhost:3001` serves the revised morphing hero. Browser checks confirmed continuous movement, working module requests, and a normal reload. JavaScript/CSS caching was disabled and hero asset URLs were versioned to bypass previously cached files.
- The revised morphing hero was checked with a stationary pointer and with reduced motion on and off. A local Chrome rendering sample averaged approximately 10ms per canvas draw at 1440px and 9ms at 390px with simulated 4x CPU slowdown. These are local samples, not physical-device performance measurements. Homepage axe checks also passed at 390px after the revision.

Reproduce the browser checks with `npm run test:browser`, following the Playwright setup in README.md. Desktop and mobile screenshots are saved under `artifacts/`.

Physical-device testing, mobile Safari, Firefox, production performance profiling, and a manual screen-reader audit remain outside this verification. Before public launch, provide verified business contact details, review legal wording, configure persistent inquiry storage and the operator's delivery workflow, and deploy with HTTPS. The form saves inquiries privately on the server; email and CRM delivery are not configured.
