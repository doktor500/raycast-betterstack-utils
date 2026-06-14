# Satori + Tailwind SVG Refactor

**Date:** 2026-06-14
**Status:** Approved

## Motivation

The existing SVG rendering layer uses React JSX components with raw SVG primitives (`<rect>`, `<text>`, `<line>`, `<path>`) and manual x/y coordinate calculations. This is hard to change and reason about. The goal is to replace it with Satori, which lets components be written as `<div>`/`<span>` elements styled via Tailwind CSS class names — the same authoring experience as normal React.

## Architecture

The rendering pipeline shape stays the same. Only the engine changes:

```
Before: JSX (<svg> primitives) → renderToStaticMarkup() → SVG string → data URI → markdown image
After:  JSX (<div>/<span> + tw prop) → satori() + satori-tailwind → SVG string → data URI → markdown image
```

Raycast's `<Detail markdown={...}>` continues to consume the output unchanged.

## New Dependencies

- `satori` — renders JSX to SVG using a CSS Flexbox layout engine
- `satori-tailwind` — preprocesses `tw="..."` prop class names into inline styles before Satori renders

## Async Cascade

`satori()` is async, so the pipeline becomes async end-to-end:

- `buildWeekViewSvg()` → `Promise<string>`
- `buildMonthViewSvg()` → `Promise<string>`
- `buildScheduleSkeletonSvg()` → `Promise<string>`
- `renderSchedule()` → `Promise<string>`
- `on-call-schedule.tsx` resolves the promise via `useState` + `useEffect`, storing the markdown string in component state before passing to `<Detail markdown={...}>`

## Fonts

Satori has no access to system fonts. Two fonts are bundled with the extension:

| Font | Use | License |
|---|---|---|
| Inter Regular | All general text (labels, names, dates) | SIL OFL |
| JetBrains Mono Regular | Time labels, grid hour markers | SIL OFL |

Font files live in `assets/fonts/`. A `font-loader.ts` utility reads both files once with `fs.readFileSync` and exports the buffers. Every `satori()` call receives the same `fonts` array:

```ts
[
  { name: 'Inter', data: interFontBuffer, weight: 400, style: 'normal' },
  { name: 'JetBrainsMono', data: jetbrainsMonoFontBuffer, weight: 400, style: 'normal' },
]
```

## Visual Simplifications

Two SVG features that have no Satori equivalent are replaced:

| Original | Replacement |
|---|---|
| `<pattern>` hatch fill on today's column | CSS `repeating-linear-gradient` stripes |
| `<filter><feDropShadow>` on span bars | CSS `box-shadow` |
| `<line>` grid lines | `<div>` with `border-bottom` / `borderRight` |
| `<text>` elements | `<span>` with `tw` prop |
| `<path>` current time marker | 1px-height `<div>` with `position: absolute` |

All positioned elements shift from absolute SVG coordinates to CSS Flexbox layout. Span bars and event segments that need precise placement use `position: absolute` within a `position: relative` container.

## Component Rewrite Plan

### Files to rewrite (SVG primitives → div/span + tw)

| File | Notes |
|---|---|
| `week-schedule.tsx` | Root: vertical flex column — banner → header → grid |
| `day-column.tsx` (week) | Flex column per day with header cell + event area |
| `week-events.tsx` | Absolutely positioned event segments within the grid |
| `event-segment.tsx` | `div` with `position: absolute`, colored background, `border-radius` |
| `hour-grid-lines.tsx` | `div` children with `border-bottom` at each hour interval |
| `hour-labels.tsx` | Flex column of `span` elements, JetBrains Mono font |
| `current-time-marker.tsx` (week) | `div` with `position: absolute`, 1px height, accent color |
| `month-schedule.tsx` | Vertical flex column of month blocks |
| `month-block.tsx` | Grid header row + week rows |
| `week-group.tsx` | Flex row for a week's span bars |
| `span-bar.tsx` | Absolutely positioned `div` with `border-radius`, `box-shadow` |
| `summary-block.tsx` | Flex row of name + hours cells |
| `current-time-marker.tsx` (month) | Thin `div` bar across the current day column |
| `on-call-pill.tsx` | Flex row with colored circle + name `span` |
| `skeleton/schedule.tsx` | Div-based placeholder blocks with opacity |
| `week-row.tsx` | Used by skeleton; rewrite from SVG `<rect>` spans to flex-row divs |

### Files unchanged

All domain and data files remain untouched:
`on-call-event.ts`, `on-call-summary.ts`, `layout.ts`, `colors.ts`, `date-utils.ts`, `time-range.ts`, `user.ts`, `rota.ts`, hooks, action panel components.

### New files

| File | Purpose |
|---|---|
| `src/common/utils/font-loader.ts` | Reads font files once, exports buffers |
| `src/ui/schedule/satori-renderer.ts` | Wraps `satori()` + `satori-tailwind` config; shared `fonts` array; replaces `renderToStaticMarkup` at all three call sites (week, month, skeleton) |
| `assets/fonts/Inter-Regular.ttf` | Bundled Inter font |
| `assets/fonts/JetBrainsMono-Regular.ttf` | Bundled JetBrains Mono font |

## Out of Scope

- No changes to Raycast API usage, data fetching, hooks, or action panel components
- No changes to domain models or business logic
- No responsive / hover / dark-mode Tailwind variants (Satori renders static output)
