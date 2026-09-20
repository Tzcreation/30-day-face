# 30-Day Skin Routine PWA — V3

Built from the working V1 logic and the tested V2 interface.

## V3 fixes
- Morning and night task IDs are now completely separate. Ticking a morning task cannot tick a night task or another day.
- Existing V1/V2 progress is migrated where the old IDs are unambiguous.
- Day 1 / Day 15 / Day 30 photos use IndexedDB instead of localStorage, with image compression, preview, replace and delete.
- Product cards use current real product-packaging image URLs, with the bundled V1-style image as a fallback if an online image is unavailable.
- 30-day calendar, persistence, dark mode, settings and PWA install/offline shell are retained.

## GitHub Pages
Replace the files in your existing repository with the contents of this folder. Keep the repository root structure unchanged. Your current site is:
https://tzcreation.github.io/30-day-face/

## Product image sources
The six product image URLs are included directly in `app.js`. They are loaded from public web image hosts and may change over time; fallback local images are bundled so the product cards do not become blank if a remote image is unavailable.
