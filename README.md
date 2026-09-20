# 30 Day Skin Routine — Version 2 (fixed)

Mobile-first PWA for the 30-day skincare routine. This build starts from the tested Version 1 and adds V2 features without changing the Version 1 storage key, so existing GitHub/phone progress can be preserved.

## V2 features
- Today dashboard with completion, done-days and streak
- 30-day calendar with day preview
- Morning/night checklists
- 6-product library
- Day 1 / 15 / 30 progress photos stored locally (compressed)
- Dark mode
- Install-app button when supported
- Settings for start date and reminder times
- Notification permission request
- PWA manifest + service worker + offline assets

## Important
Replace the old V1 files in the GitHub repository with all files from this ZIP. Do not upload only `index.html` and `app.js`; the images, icons, manifest, CSS and service worker are also required.

The app keeps the V1 `skinRoutineState` localStorage key so existing V1 completion data is readable.
