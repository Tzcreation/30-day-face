30 Day Skin Routine V4 — Clean Compact Edition

Features:
- Single-screen compact Home on Samsung S23-sized displays; no tab scrolling.
- Morning and Night task buttons use unique IDs and are independently tappable.
- Existing skinRoutineState progress is preserved and migrated.
- Day 1/15/30 local progress photos via IndexedDB.
- 30-day grid and 6-product compact grid fit the viewport.
- Notification permission + test notification and scheduled foreground reminders.

Notification limitation:
Web/PWA local notifications are browser/OS controlled. This build schedules reminders while the app is open/active. Exact background reminders when the app is fully closed require Web Push/server infrastructure and are not guaranteed by the standard Notification API alone.
