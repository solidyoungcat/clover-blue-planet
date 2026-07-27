# Task 1.2 Report — 共享布局组件

**Date:** 2026-07-27  
**Status:** ✅ Complete  
**Commit:** `1f11d85` — `feat: add AppLayout, TopBar, ResizableSplit with ocean design tokens`

## Files Created

| File | Description |
|------|-------------|
| `packages/shared/src/lib/constants.ts` | Design token constants (COLORS, LAYOUT) |
| `packages/shared/src/components/layout/TopBar.tsx` | TopBar — room code, partner status, theme/settings buttons |
| `packages/shared/src/components/layout/ResizableSplit.tsx` | ResizableSplit — drag-to-resize left/right panel (30%–85% range) |
| `packages/shared/src/components/layout/AppLayout.tsx` | AppLayout — full-screen layout composing TopBar + ResizableSplit |
| `packages/web/src/App.tsx` | Web App entry — renders AppLayout with placeholder content |
| `packages/web/src/index.css` | Tailwind CSS directives (@tailwind base/components/utilities) |

## Files Modified

| File | Change |
|------|--------|
| `packages/shared/src/index.ts` | Replaced stub with exports for AppLayout, TopBar, ResizableSplit, COLORS, LAYOUT |
| `packages/web/src/main.tsx` | Replaced inline App with split main.tsx + App.tsx, added index.css import |

## Verification

- ✅ `pnpm build:web` — TypeScript type-check (`tsc`) + Vite build pass
- ✅ 36 modules transformed, output: dist/index.html + CSS + JS
- ✅ `git commit` on `master` branch

## Components

- **TopBar** — 48px height, semi-transparent ocean bg with backdrop blur, room code display + copy button, partner online/offline indicator, theme/settings buttons. All labels in Chinese.
- **ResizableSplit** — Flex-based split panel with mouse-drag resize handle. Default 70/30 ratio, constrained between 30%–85%. Uses document-level mouse events for smooth dragging.
- **AppLayout** — Wraps TopBar + ResizableSplit in full-screen flex column (`h-screen w-screen`). Accepts playerArea and chatArea as ReactNode slots.
- **Design tokens** — COLORS (ocean palette: bg/surface/card, text primary/muted, primary, accent, border) and LAYOUT (topBarHeight: 48, defaultSplitRatio: 70, minPanelWidth: 280).

## Issues Encountered

None. All files created per the brief spec, build passed on first attempt.
