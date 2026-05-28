# Mockup photos — drop your real photos here

This folder is served at `/fansnap/mock/...` in production.

## events/ — one cover photo per event

Filename must match the **lowercase event code**.

| Drop a file at... | Becomes the cover of... |
|---|---|
| `events/ccxp-26.jpg`  | CCXP México 2026 *(primary featured)* |
| `events/bb-001.jpg`   | Bad Bunny — Most Wanted Tour |
| `events/ro-014.jpg`   | Rosalía — Motomami World Tour |
| `events/mx-mtn.jpg`   | Maratón CDMX 2026 |
| `events/cc-26.jpg`    | Corona Capital |
| `events/fcj-22.jpg`   | FC Juárez vs Pumas |
| `events/ae-08.jpg`    | Anime Expo Guadalajara |
| `events/edc-26.jpg`   | EDC México 2026 |
| `events/ll-26.jpg`    | Lollapalooza México 2026 |

## photos/ — the 12 gallery photos a fan sees after their scan

Filename is the slot number, `1.jpg` through `12.jpg`.

| Drop a file at... | Becomes... |
|---|---|
| `photos/1.jpg`   | 1st photo in the scan-result gallery (timestamp 21:34) |
| `photos/2.jpg`   | 2nd (21:42) |
| `photos/3.jpg`   | 3rd (21:51) |
| ... | ... |
| `photos/12.jpg`  | 12th (23:48) |

## Tips

- **Format:** `.jpg`, `.png`, or `.webp` all work. **Extension must be `.jpg`** in the filename because the code looks for `.jpg` — if you have a `.png`, just rename it.
- **Size:** keep width ≤ 1600px so the page loads fast. The site downscales on display anyway.
- **Missing files:** if a slot has no file, the colored fallback tile shows underneath (no broken-image icon).
- **Local vs picsum:** to go back to the picsum.photos placeholders (e.g. for a demo when you don't have real photos for a slot), open `src/lib/mock.ts` and set `USE_LOCAL_MOCKS = false`.

## After dropping files

```bash
# preview locally
npm run dev
# then open http://localhost:3000/fansnap

# or push live
npm run deploy
git add public/mock/ && git commit -m "Add mockup photos" && git push
```
