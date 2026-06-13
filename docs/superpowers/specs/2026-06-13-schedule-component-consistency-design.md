# Schedule Component Consistency Design

**Date:** 2026-06-13
**Scope:** `src/ui/schedule/components/month/` and `src/ui/schedule/components/week/`

## Problem

The `month/` and `week/` directories grew independently and now have four structural inconsistencies:

1. **Component granularity** — month uses singular components mapped by the parent; week bundles the loop inside the component.
2. **Current-time marker naming** — month calls it `TodayMarker`, week calls it `CurrentTimeMarker`.
3. **Layout constants location** — week has a local `constants.ts` with `WEEK.*`; month imports directly from the shared `LAYOUT` object.
4. **No extracted event-segment component in week** — month has `SpanBar` (singular, self-contained); week renders event rects inline inside `WeekEvents`.

## Design

### 1. Extract singular `DayColumn` in week

- Delete `day-columns.tsx`.
- Create `day-column.tsx` with a `DayColumn` component that renders one column (vertical grid line, today highlight rect, weekday/date text).
- Props: `day`, `dayIndex`, `isToday`, `gridTop`, `headerTop`, `totalHeight`.
- `week-schedule.tsx` gains the loop: `days.map((day, dayIndex) => <DayColumn ... />)`.

**Before:** `<DayColumns days={days} today={today} gridTop={gridTop} headerTop={headerTop} totalHeight={totalHeight} />`
**After:** `{days.map((day, dayIndex) => <DayColumn day={day} dayIndex={dayIndex} isToday={isSameDay(day, today)} ... />)}`

### 2. Extract singular `EventSegment` in week

- Create `event-segment.tsx` with an `EventSegment` component that renders one segment rect + label.
- Props: `segment` (`DaySegment`), `colX`, `colWidth`, `gridTop`.
- `week-events.tsx` keeps `getDaySegments` and the day/segment loops, replacing the inline `<rect>` + `<text>` with `<EventSegment>`.
- This mirrors the month pattern: `WeekGroup` owns the loop → `SpanBar` owns the rendering.

### 3. Rename `TodayMarker` → `CurrentTimeMarker` in month

- Rename `today-marker.tsx` → `current-time-marker.tsx`.
- Rename component from `TodayMarker` to `CurrentTimeMarker`.
- Update import in `week-group.tsx`.
- No behavior change.

### 4. Add `month/constants.ts` with `MONTH.*`

- Create `constants.ts` in `month/` that imports from the shared `LAYOUT` and re-exports month-relevant values under a `MONTH` namespace.
- Values: `WIDTH`, `DAY_WIDTH`, `BLOCK_HEADER_HEIGHT`, `DAY_HEADER_HEIGHT`, `H_GAP`, `ROW_TOP`, `ROW_HEIGHT`, `BAR_GAP`.
- Update `day-column.tsx`, `span-bar.tsx`, `current-time-marker.tsx`, `week-group.tsx`, `month-block.tsx` to import from `./constants` using `MONTH.*` instead of `LAYOUT.*` for layout constants.
- The shared `LAYOUT` in `layout.ts` is not modified — it owns the source values; `MONTH` aliases them to give month the same access pattern as week's `WEEK.*`.

## Resulting file structure

```
month/
  constants.ts             ← new: MONTH.* aliases
  current-time-marker.tsx  ← renamed from today-marker.tsx
  day-column.tsx
  month-block.tsx
  month-schedule.tsx
  span-bar.tsx
  summary-block.tsx
  week-group.tsx

week/
  constants.ts
  current-time-marker.tsx
  day-column.tsx           ← new: singular, extracted from day-columns.tsx
  day-columns.tsx          ← deleted
  event-segment.tsx        ← new: singular, extracted from week-events.tsx
  hour-grid-lines.tsx
  hour-labels.tsx
  week-events.tsx          ← retains loop + getDaySegments, renders <EventSegment>
  week-schedule.tsx
```

## Non-goals

- No changes to shared `layout.ts` computation functions.
- No changes to `summary-block.tsx` (no week equivalent — by design).
- No changes to `hour-grid-lines.tsx` or `hour-labels.tsx` (week-specific, no month counterpart).
- No visual or behavioral changes.
