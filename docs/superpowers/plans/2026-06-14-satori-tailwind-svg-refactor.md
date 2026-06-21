# Satori + Tailwind SVG Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `renderToStaticMarkup` + raw SVG primitives with Satori + `satori-tailwind` so every schedule component is authored as `<div>`/`<span>` with a `tw` prop.

**Architecture:** `satori-tailwind` wraps Satori and preprocesses `tw="..."` class strings to inline styles before rendering to SVG. Component files switch from `<rect>`/`<text>`/`<line>` to `<div>`/`<span>` with Tailwind classes for static styles and `style` objects for dynamic pixel values. All three root builders (`buildWeekViewSvg`, `buildMonthViewSvg`, `buildScheduleSkeletonSvg`) become `async`, cascading through `renderSchedule` to `on-call-schedule.tsx` where a `useEffect` resolves the promise into state.

**Tech Stack:** `satori`, `satori-tailwind`, Inter Regular (bundled), JetBrains Mono Regular (bundled), React 19, TypeScript 6

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `assets/fonts/Inter-Regular.ttf` | Bundled general font |
| Create | `assets/fonts/JetBrainsMono-Regular.ttf` | Bundled mono font for hour labels |
| Create | `src/common/utils/font-loader.ts` | Reads both fonts once, exports `SatoriFont[]` |
| Create | `src/ui/schedule/satori-renderer.ts` | Wraps `satori-tailwind`, exports `renderToSvg(el, w, h)` |
| Modify | `raycast-env.d.ts` | Adds `tw?: string` to JSX intrinsic element attrs |
| Modify | `src/ui/schedule/components/on-call-pill.tsx` | Div/flex pill, removes `cy` prop and SVG `<animate>` |
| Modify | `src/ui/schedule/components/week/hour-grid-lines.tsx` | 1px divs replacing `<line>` elements |
| Modify | `src/ui/schedule/components/week/hour-labels.tsx` | `<span>` replacing `<text>`, JetBrains Mono |
| Modify | `src/ui/schedule/components/week/day-column.tsx` | Absolutely-positioned div header + border |
| Modify | `src/ui/schedule/components/week/event-segment.tsx` | Absolutely-positioned colored div |
| Modify | `src/ui/schedule/components/week/week-events.tsx` | Fragment of EventSegment, no SVG wrapper |
| Modify | `src/ui/schedule/components/week/current-time-marker.tsx` | 1px-height absolute div |
| Modify | `src/ui/schedule/components/week/week-schedule.tsx` | Root div, async `buildWeekViewSvg` |
| Modify | `src/ui/schedule/components/month/span-bar.tsx` | Absolutely-positioned div, CSS box-shadow, removes `clipId` |
| Modify | `src/ui/schedule/components/month/day-column.tsx` | Absolutely-positioned div, CSS stripe for weekend |
| Modify | `src/ui/schedule/components/month/current-time-marker.tsx` | 4px-wide absolute div (vertical line) |
| Modify | `src/ui/schedule/components/month/week-group.tsx` | Relative-positioned div row, removes `offsetY`/`baseId` |
| Modify | `src/ui/schedule/components/month/summary-block.tsx` | Flex row, removes `offsetY` |
| Modify | `src/ui/schedule/components/month/month-block.tsx` | Flex column, removes `blockOffsetY` |
| Modify | `src/ui/schedule/components/month/month-schedule.tsx` | Root div, async `buildMonthViewSvg` |
| Modify | `src/ui/schedule/components/week/week-row.tsx` | Flex-row divs replacing SVG rects (skeleton) |
| Modify | `src/ui/schedule/skeleton/schedule.tsx` | Div-based skeleton, async `buildScheduleSkeletonSvg` |
| Modify | `src/ui/schedule/schedule-renderer.ts` | async `renderSchedule` |
| Modify | `src/on-call-schedule.tsx` | `useState<string>` + `useEffect` for async markdown |

---

## Task 1: Install packages and bundle fonts

**Files:**
- Modify: `package.json`
- Create: `assets/fonts/Inter-Regular.ttf`
- Create: `assets/fonts/JetBrainsMono-Regular.ttf`

- [ ] **Step 1: Install satori and satori-tailwind**

```bash
cd /Users/davidmolinero/dev/raycast-betterstack
npm install satori satori-tailwind
```

Expected: `package.json` shows both packages in `dependencies`, `node_modules/satori` and `node_modules/satori-tailwind` exist.

- [ ] **Step 2: Download Inter Regular font**

```bash
mkdir -p /Users/davidmolinero/dev/raycast-betterstack/assets/fonts
curl -L "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.otf" \
  -o /Users/davidmolinero/dev/raycast-betterstack/assets/fonts/Inter-Regular.otf
# Satori accepts both OTF and TTF. Rename to .ttf is fine since the format is identical.
cp /Users/davidmolinero/dev/raycast-betterstack/assets/fonts/Inter-Regular.otf \
   /Users/davidmolinero/dev/raycast-betterstack/assets/fonts/Inter-Regular.ttf
rm /Users/davidmolinero/dev/raycast-betterstack/assets/fonts/Inter-Regular.otf
```

Alternative if curl fails — download Inter-Regular.ttf from https://fonts.google.com/specimen/Inter and place at `assets/fonts/Inter-Regular.ttf`.

- [ ] **Step 3: Download JetBrains Mono Regular font**

```bash
curl -L "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf" \
  -o /Users/davidmolinero/dev/raycast-betterstack/assets/fonts/JetBrainsMono-Regular.ttf
```

Alternative: download from https://www.jetbrains.com/lp/mono/ and place at `assets/fonts/JetBrainsMono-Regular.ttf`.

- [ ] **Step 4: Verify both font files exist and are non-empty**

```bash
ls -lh /Users/davidmolinero/dev/raycast-betterstack/assets/fonts/
```

Expected: both `.ttf` files listed, each at least 100KB.

- [ ] **Step 5: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add assets/fonts/ package.json package-lock.json
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "feat: add satori + satori-tailwind + bundled fonts"
```

---

## Task 2: Add `tw` TypeScript declaration and font-loader

**Files:**
- Modify: `raycast-env.d.ts`
- Create: `src/common/utils/font-loader.ts`

- [ ] **Step 1: Add `tw` prop to JSX intrinsic element attributes in raycast-env.d.ts**

Read the current file first:
```bash
cat /Users/davidmolinero/dev/raycast-betterstack/raycast-env.d.ts
```

Append to the end of the file (after existing content):
```typescript
declare namespace React {
  interface HTMLAttributes<T> {
    tw?: string;
  }
}
```

- [ ] **Step 2: Create font-loader.ts**

```typescript
// src/common/utils/font-loader.ts
import { environment } from "@raycast/api";
import { readFileSync } from "node:fs";
import path from "node:path";

interface SatoriFont {
  name: string;
  data: ArrayBuffer;
  weight: 400;
  style: "normal";
}

let cached: SatoriFont[] | null = null;

export function loadFonts(): SatoriFont[] {
  if (cached) return cached;

  const interBuffer = readFileSync(path.join(environment.assetsPath, "fonts", "Inter-Regular.ttf"));
  const monoBuffer = readFileSync(path.join(environment.assetsPath, "fonts", "JetBrainsMono-Regular.ttf"));

  const toArrayBuffer = (buffer: Buffer): ArrayBuffer =>
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

  cached = [
    { name: "Inter", data: toArrayBuffer(interBuffer), weight: 400, style: "normal" },
    { name: "JetBrainsMono", data: toArrayBuffer(monoBuffer), weight: 400, style: "normal" },
  ];

  return cached;
}
```

- [ ] **Step 3: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add raycast-env.d.ts src/common/utils/font-loader.ts
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "feat: add font-loader and tw prop type declaration"
```

---

## Task 3: Create satori-renderer.ts

**Files:**
- Create: `src/ui/schedule/satori-renderer.ts`

- [ ] **Step 1: Check satori-tailwind's export shape**

```bash
node -e "const m = require('satori-tailwind'); console.log(Object.keys(m))"
```

Note the output. If it exports a `default` that is a function, use `import satori from 'satori-tailwind'`. If it exports a named function, adjust the import accordingly.

- [ ] **Step 2: Create satori-renderer.ts**

```typescript
// src/ui/schedule/satori-renderer.ts
import satori from "satori-tailwind";
import type { ReactNode } from "react";
import { loadFonts } from "@/common/utils/font-loader";

// satori-tailwind is a drop-in wrapper around satori that processes `tw` props
// by converting Tailwind class strings to inline styles before rendering.
// If this import fails to process tw props, check the package README for the
// correct integration pattern (some versions export a named `satoriTailwind` fn).
export async function renderToSvg(element: ReactNode, width: number, height: number): Promise<string> {
  return satori(element, { width, height, fonts: loadFonts() });
}
```

- [ ] **Step 3: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add src/ui/schedule/satori-renderer.ts
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "feat: add satori-renderer wrapping satori-tailwind"
```

---

## Task 4: Rewrite on-call-pill.tsx

**Files:**
- Modify: `src/ui/schedule/components/on-call-pill.tsx`

The SVG version used a `cy` coordinate and an SVG `<animate>` pulse ring. The new version is a self-contained flex row with a colored circle. The pulse animation is dropped (Satori renders static output). The `cy` prop is removed; callers pass only `name` and `color`. The exported constant `ON_CALL_PILL_CIRC_R = 16` is kept (callers use it for banner height calculations).

- [ ] **Step 1: Replace on-call-pill.tsx**

```tsx
// src/ui/schedule/components/on-call-pill.tsx
import { getThemeColor, Colors } from "@/common/colors";

export const ON_CALL_PILL_CIRC_R = 16;

interface OnCallPillProps {
  name: string;
  color: string;
}

export function OnCallPill({ name, color }: OnCallPillProps) {
  const initial = name.charAt(0).toUpperCase();
  const diameter = ON_CALL_PILL_CIRC_R * 2;

  return (
    <div
      tw="flex items-center"
      style={{ height: diameter, paddingLeft: 12, paddingTop: 6, gap: 13 }}
    >
      <div
        tw="flex items-center justify-center"
        style={{
          width: diameter,
          height: diameter,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: getThemeColor(color) }}>{initial}</span>
      </div>
      <span style={{ fontSize: 17, fontWeight: 500, color: Colors.WHITE }}>
        {`${name} is on-call`}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add src/ui/schedule/components/on-call-pill.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor(pill): rewrite OnCallPill as Satori div/flex component"
```

---

## Task 5: Rewrite hour-grid-lines.tsx and hour-labels.tsx

**Files:**
- Modify: `src/ui/schedule/components/week/hour-grid-lines.tsx`
- Modify: `src/ui/schedule/components/week/hour-labels.tsx`

- [ ] **Step 1: Replace hour-grid-lines.tsx**

`gridTop` is passed by the parent to offset the grid below the header/banner. Each line becomes a 1px-high absolutely positioned div.

```tsx
// src/ui/schedule/components/week/hour-grid-lines.tsx
import { Colors } from "@/common/colors";
import { WEEK } from "@/ui/schedule/components/week/constants";

export function HourGridLines({ gridTop }: { gridTop: number }) {
  return (
    <>
      {Array.from({ length: WEEK.HOURS }, (_, hourIndex) => (
        <div
          key={`hg${hourIndex}`}
          style={{
            position: "absolute",
            left: WEEK.SIDEBAR_WIDTH,
            top: gridTop + hourIndex * WEEK.HOUR_HEIGHT,
            width: WEEK.WIDTH - WEEK.SIDEBAR_WIDTH,
            height: 1,
            backgroundColor: Colors.SLATE,
          }}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 2: Replace hour-labels.tsx**

Hour numbers are displayed in JetBrains Mono, right-aligned against the grid edge.

```tsx
// src/ui/schedule/components/week/hour-labels.tsx
import { Colors } from "@/common/colors";
import { WEEK } from "@/ui/schedule/components/week/constants";

export function HourLabels({ gridTop }: { gridTop: number }) {
  return (
    <>
      {Array.from({ length: WEEK.HOURS }, (_, hourIndex) => (
        <div
          key={`hl${hourIndex}`}
          tw="flex items-center justify-end"
          style={{
            position: "absolute",
            left: 0,
            top: gridTop + hourIndex * WEEK.HOUR_HEIGHT,
            width: WEEK.SIDEBAR_WIDTH - 2,
            height: WEEK.HOUR_HEIGHT,
            fontSize: 10,
            color: Colors.DIM,
            fontFamily: "JetBrainsMono",
          }}
        >
          {hourIndex}
        </div>
      ))}
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add \
  src/ui/schedule/components/week/hour-grid-lines.tsx \
  src/ui/schedule/components/week/hour-labels.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor(week): rewrite HourGridLines and HourLabels as Satori divs"
```

---

## Task 6: Rewrite week/day-column.tsx

**Files:**
- Modify: `src/ui/schedule/components/week/day-column.tsx`

The column is an absolutely positioned group: a vertical rule, an optional highlight on today, and a header label. The props `gridTop`, `headerTop`, `totalHeight` are still passed from the parent.

- [ ] **Step 1: Replace week/day-column.tsx**

```tsx
// src/ui/schedule/components/week/day-column.tsx
import { Colors } from "@/common/colors";
import { formatWeekday } from "@/ui/layout";
import { WEEK } from "@/ui/schedule/components/week/constants";

interface DayColumnProps {
  day: Date;
  dayIndex: number;
  isToday: boolean;
  gridTop: number;
  headerTop: number;
  totalHeight: number;
}

export function DayColumn({ day, dayIndex, isToday, gridTop, headerTop, totalHeight }: DayColumnProps) {
  const colLeft = WEEK.SIDEBAR_WIDTH + dayIndex * WEEK.DAY_WIDTH;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: colLeft,
          top: gridTop,
          width: 1,
          height: totalHeight - gridTop,
          backgroundColor: Colors.SLATE,
        }}
      />
      {isToday && (
        <div
          style={{
            position: "absolute",
            left: colLeft,
            top: headerTop,
            width: WEEK.DAY_WIDTH,
            height: WEEK.HEADER_HEIGHT,
            borderRadius: 6,
            backgroundColor: Colors.DEEP_DARK,
            opacity: 0.5,
          }}
        />
      )}
      <div
        tw="flex items-center justify-center"
        style={{
          position: "absolute",
          left: colLeft,
          top: headerTop,
          width: WEEK.DAY_WIDTH,
          height: WEEK.HEADER_HEIGHT,
          gap: 4,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: Colors.WHITE,
            opacity: isToday ? 1 : 0.65,
            fontFamily: "Inter",
          }}
        >
          {`${formatWeekday(day)} `}
        </span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: Colors.WHITE,
            opacity: isToday ? 1 : 0.75,
            fontFamily: "Inter",
          }}
        >
          {`${day.getDate()}/${day.getMonth() + 1}`}
        </span>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add src/ui/schedule/components/week/day-column.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor(week): rewrite DayColumn as Satori div"
```

---

## Task 7: Rewrite event-segment.tsx and week-events.tsx

**Files:**
- Modify: `src/ui/schedule/components/week/event-segment.tsx`
- Modify: `src/ui/schedule/components/week/week-events.tsx`

- [ ] **Step 1: Replace event-segment.tsx**

The segment is an absolutely positioned colored div. `overflow: hidden` clips the label naturally, replacing the SVG `<clipPath>`. Positions are calculated from `gridTop` + fractional offsets.

```tsx
// src/ui/schedule/components/week/event-segment.tsx
import { getThemeColor } from "@/common/colors";
import { truncateLabel } from "@/ui/layout";
import { WEEK } from "@/ui/schedule/components/week/constants";

export interface DaySegment {
  startFraction: number;
  endFraction: number;
  label: string;
  color: string;
}

interface EventSegmentProps {
  segment: DaySegment;
  colLeft: number;
  colWidth: number;
  gridTop: number;
}

export function EventSegment({ segment, colLeft, colWidth, gridTop }: EventSegmentProps) {
  const top = gridTop + segment.startFraction * WEEK.TIMELINE_HEIGHT;
  const height = Math.max(WEEK.MIN_EVENT_HEIGHT, (segment.endFraction - segment.startFraction) * WEEK.TIMELINE_HEIGHT);
  const themeColor = getThemeColor(segment.color);
  const showName = height >= WEEK.LABEL_MIN_HEIGHT;

  return (
    <div
      style={{
        position: "absolute",
        left: colLeft,
        top,
        width: colWidth,
        height,
        backgroundColor: segment.color,
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {showName && (
        <span
          style={{
            position: "absolute",
            left: 12,
            top: 4,
            fontSize: 14,
            fontWeight: 600,
            color: themeColor,
            fontFamily: "Inter",
            whiteSpace: "nowrap",
          }}
        >
          {truncateLabel(segment.label, colWidth - 22, 14)}
        </span>
      )}
    </div>
  );
}
```

Note: the prop was renamed from `colX` to `colLeft` — update the caller in week-events.tsx accordingly (Step 2).

- [ ] **Step 2: Replace week-events.tsx**

```tsx
// src/ui/schedule/components/week/week-events.tsx
import { getColor } from "@/common/colors";
import { OnCallEvent } from "@/domain/on-call-event";
import { WEEK } from "@/ui/schedule/components/week/constants";
import { EventSegment, type DaySegment } from "@/ui/schedule/components/week/event-segment";
import { formatUserName } from "@/domain/user";

export type { DaySegment } from "@/ui/schedule/components/week/event-segment";

interface WeekEventsProps {
  days: Date[];
  events: OnCallEvent[];
  gridTop: number;
}

export function WeekEvents({ days, events, gridTop }: WeekEventsProps) {
  return (
    <>
      {days.map((day, dayIndex) => {
        const segments = getDaySegments(events, day);
        const colLeft = WEEK.SIDEBAR_WIDTH + dayIndex * WEEK.DAY_WIDTH + 2;
        const colWidth = WEEK.DAY_WIDTH - 4;
        return segments.map((segment, segmentIndex) => (
          <EventSegment
            key={`ev${dayIndex}-${segmentIndex}`}
            segment={segment}
            colLeft={colLeft}
            colWidth={colWidth}
            gridTop={gridTop}
          />
        ));
      })}
    </>
  );
}

function getDaySegments(events: OnCallEvent[], dayStart: Date): DaySegment[] {
  const DAY_MS = 24 * 3600 * 1000;
  const dayStartMs = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate()).getTime();
  const dayEndMs = dayStartMs + DAY_MS;

  return events.flatMap((event) => {
    const eventStart = new Date(event.startedAt).getTime();
    const eventEnd = new Date(event.endedAt).getTime();
    const segStart = Math.max(eventStart, dayStartMs);
    const segEnd = Math.min(eventEnd, dayEndMs);
    if (segEnd <= segStart) return [];

    const userName = formatUserName(event.user);
    const color = getColor(userName);

    return [
      {
        startFraction: (segStart - dayStartMs) / DAY_MS,
        endFraction: (segEnd - dayStartMs) / DAY_MS,
        label: userName,
        color,
      },
    ];
  });
}
```

- [ ] **Step 3: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add \
  src/ui/schedule/components/week/event-segment.tsx \
  src/ui/schedule/components/week/week-events.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor(week): rewrite EventSegment and WeekEvents as Satori divs"
```

---

## Task 8: Rewrite week/current-time-marker.tsx

**Files:**
- Modify: `src/ui/schedule/components/week/current-time-marker.tsx`

Replaces `<circle>` + `<line>` with a 4px-high absolute div spanning today's column.

- [ ] **Step 1: Replace week/current-time-marker.tsx**

```tsx
// src/ui/schedule/components/week/current-time-marker.tsx
import { Colors } from "@/common/colors";
import { WEEK } from "@/ui/schedule/components/week/constants";

interface CurrentTimeMarkerProps {
  todayIndex: number;
  markerY: number;
}

export function CurrentTimeMarker({ todayIndex, markerY }: CurrentTimeMarkerProps) {
  const left = WEEK.SIDEBAR_WIDTH + todayIndex * WEEK.DAY_WIDTH + 4;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top: markerY - 2,
        width: WEEK.DAY_WIDTH - 6,
        height: 4,
        backgroundColor: Colors.WHITE,
        opacity: 0.85,
        borderRadius: 2,
      }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add src/ui/schedule/components/week/current-time-marker.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor(week): rewrite CurrentTimeMarker as Satori div"
```

---

## Task 9: Rewrite week-schedule.tsx (async root)

**Files:**
- Modify: `src/ui/schedule/components/week/week-schedule.tsx`

The root component becomes a `<div>` with `position: relative`. The export `buildWeekViewSvg` switches from sync `string` to `async Promise<string>`, calling `renderToSvg` instead of `renderToStaticMarkup`. The `OnCallPill` no longer takes `cy` — just `name` and `color`.

- [ ] **Step 1: Replace week-schedule.tsx**

```tsx
// src/ui/schedule/components/week/week-schedule.tsx
import React from "react";
import { getCurrentWeekDays, isSameDay, TimeWindow } from "@/common/utils/date-utils";
import { OnCallEvent } from "@/domain/on-call-event";
import { OnCallUser } from "@/domain/user";
import { ON_CALL_PILL_CIRC_R, OnCallPill } from "@/ui/schedule/components/on-call-pill";
import { WEEK } from "@/ui/schedule/components/week/constants";
import { HourGridLines } from "@/ui/schedule/components/week/hour-grid-lines";
import { HourLabels } from "@/ui/schedule/components/week/hour-labels";
import { DayColumn } from "@/ui/schedule/components/week/day-column";
import { WeekEvents } from "@/ui/schedule/components/week/week-events";
import { CurrentTimeMarker } from "@/ui/schedule/components/week/current-time-marker";
import { Colors } from "@/common/colors";
import { renderToSvg } from "@/ui/schedule/satori-renderer";

interface WeekViewProps {
  events: OnCallEvent[];
  window: TimeWindow;
  onCallUser?: OnCallUser;
}

function WeekViewRoot({ events, window, onCallUser }: WeekViewProps) {
  const today = new Date();
  const days = getCurrentWeekDays(window.start);
  const todayIndex = days.findIndex((day) => isSameDay(day, today));

  const bannerHeight = onCallUser ? ON_CALL_PILL_CIRC_R * 2 : 0;
  const headerTop = bannerHeight;
  const gridTop = bannerHeight + WEEK.HEADER_HEIGHT;
  const totalHeight = WEEK.TOTAL_HEIGHT + bannerHeight;

  const todayStartMs =
    todayIndex >= 0 ? new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() : 0;
  const nowFraction = todayIndex >= 0 ? (today.getTime() - todayStartMs) / (24 * 3600 * 1000) : 0;
  const markerY = gridTop + nowFraction * WEEK.TIMELINE_HEIGHT;

  return (
    <div
      style={{
        position: "relative",
        width: WEEK.WIDTH,
        height: totalHeight,
        backgroundColor: onCallUser ? "transparent" : Colors.DARK,
      }}
    >
      {onCallUser && <OnCallPill name={onCallUser.name} color={onCallUser.color} />}
      <HourGridLines gridTop={gridTop} />
      <HourLabels gridTop={gridTop} />
      {days.map((day, dayIndex) => (
        <DayColumn
          key={dayIndex}
          day={day}
          dayIndex={dayIndex}
          isToday={isSameDay(day, today)}
          gridTop={gridTop}
          headerTop={headerTop}
          totalHeight={totalHeight}
        />
      ))}
      <WeekEvents days={days} events={events} gridTop={gridTop} />
      {todayIndex >= 0 && <CurrentTimeMarker todayIndex={todayIndex} markerY={markerY} />}
    </div>
  );
}

export async function buildWeekViewSvg(props: WeekViewProps): Promise<string> {
  const bannerHeight = props.onCallUser ? ON_CALL_PILL_CIRC_R * 2 : 0;
  const totalHeight = WEEK.TOTAL_HEIGHT + bannerHeight;
  return renderToSvg(<WeekViewRoot {...props} />, WEEK.WIDTH, totalHeight);
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add src/ui/schedule/components/week/week-schedule.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor(week): rewrite WeekViewRoot as Satori div, make buildWeekViewSvg async"
```

---

## Task 10: Rewrite month/span-bar.tsx

**Files:**
- Modify: `src/ui/schedule/components/month/span-bar.tsx`

Removes the `clipId` prop (no longer needed — `overflow: hidden` handles clipping). Replaces SVG `<clipPath>/<rect>/<text>` with a div. The `filter="url(#shadow)"` becomes CSS `boxShadow`.

- [ ] **Step 1: Replace month/span-bar.tsx**

```tsx
// src/ui/schedule/components/month/span-bar.tsx
import { type WeekSpanBar, truncateLabel } from "@/ui/layout";
import { getThemeColor } from "@/common/colors";
import { MONTH } from "@/ui/schedule/components/month/constants";

interface SpanBarProps {
  bar: WeekSpanBar;
}

export function SpanBar({ bar }: SpanBarProps) {
  const leftX = bar.startDayIndex * MONTH.DAY_WIDTH + bar.startFraction * MONTH.DAY_WIDTH;
  const rightX = bar.endDayIndex * MONTH.DAY_WIDTH + bar.endFraction * MONTH.DAY_WIDTH;
  const barLeft = leftX + MONTH.H_GAP;
  const barWidth = Math.max(rightX - leftX - 2 * MONTH.H_GAP, 2);
  const barTop = MONTH.ROW_TOP + bar.lane * (MONTH.ROW_HEIGHT + MONTH.BAR_GAP);
  const themeColor = getThemeColor(bar.color);
  const borderRadius = Math.min(6, Math.floor(barWidth / 3));
  const textAvailWidth = barWidth - 22;
  const label = textAvailWidth > 15 ? truncateLabel(bar.label, textAvailWidth, 16) : "";

  return (
    <div
      tw="flex items-center"
      style={{
        position: "absolute",
        left: barLeft,
        top: barTop,
        width: barWidth,
        height: MONTH.ROW_HEIGHT,
        backgroundColor: bar.color,
        borderRadius,
        boxShadow: "0 2px 4px rgba(11,12,21,0.3)",
        overflow: "hidden",
      }}
    >
      {label && (
        <span
          style={{
            paddingLeft: 12,
            fontSize: 16,
            fontWeight: 600,
            color: themeColor,
            fontFamily: "Inter",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add src/ui/schedule/components/month/span-bar.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor(month): rewrite SpanBar as Satori div, remove clipId"
```

---

## Task 11: Rewrite month/day-column.tsx

**Files:**
- Modify: `src/ui/schedule/components/month/day-column.tsx`

The hatch fill (`url(#hatch)`) is replaced with CSS `repeating-linear-gradient` stripes. Each day is an absolutely positioned div. Out-of-month days show stripes only; in-month days add left border, header separator, weekday abbreviation, and day number.

- [ ] **Step 1: Replace month/day-column.tsx**

```tsx
// src/ui/schedule/components/month/day-column.tsx
import { formatWeekday } from "@/ui/layout";
import { Colors } from "@/common/colors";
import { MONTH } from "@/ui/schedule/components/month/constants";

const WEEKEND_STRIPES =
  "repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(45,55,76,0.5) 3px, rgba(45,55,76,0.5) 4px)";

interface DayColumnProps {
  day: Date;
  index: number;
  currentMonth: { year: number; month: number };
  columnBg: string;
  rowHeight: number;
}

export function DayColumn({ day, index, currentMonth, columnBg, rowHeight }: DayColumnProps) {
  const left = index * MONTH.DAY_WIDTH;
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  const inMonth = day.getFullYear() === currentMonth.year && day.getMonth() === currentMonth.month;

  return (
    <div style={{ position: "absolute", left, top: 0, width: MONTH.DAY_WIDTH, height: rowHeight }}>
      {columnBg !== "none" && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: columnBg }} />
      )}
      {isWeekend && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: WEEKEND_STRIPES,
            opacity: inMonth ? 1 : 0.3,
          }}
        />
      )}
      {inMonth && (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1,
              height: rowHeight,
              backgroundColor: Colors.SLATE,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: MONTH.DAY_HEADER_HEIGHT,
              width: MONTH.DAY_WIDTH,
              height: 1,
              backgroundColor: Colors.SLATE,
            }}
          />
          <div
            tw="flex items-center justify-end"
            style={{
              position: "absolute",
              left: 0,
              top: 4,
              width: MONTH.DAY_WIDTH / 2 - 3,
              height: MONTH.DAY_HEADER_HEIGHT - 4,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: Colors.DIM, fontFamily: "Inter" }}>
              {formatWeekday(day)}
            </span>
          </div>
          <div
            tw="flex items-center"
            style={{
              position: "absolute",
              left: MONTH.DAY_WIDTH / 2 + 3,
              top: 4,
              height: MONTH.DAY_HEADER_HEIGHT - 4,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600, color: Colors.SUBTLE, fontFamily: "Inter" }}>
              {day.getDate()}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add src/ui/schedule/components/month/day-column.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor(month): rewrite DayColumn as Satori div, replace hatch with CSS stripes"
```

---

## Task 12: Rewrite month/current-time-marker.tsx

**Files:**
- Modify: `src/ui/schedule/components/month/current-time-marker.tsx`

Replaces `<line>` + `<circle>` with a 4px-wide absolutely positioned vertical div.

- [ ] **Step 1: Replace month/current-time-marker.tsx**

```tsx
// src/ui/schedule/components/month/current-time-marker.tsx
import { Colors } from "@/common/colors";
import { MONTH } from "@/ui/schedule/components/month/constants";

interface CurrentTimeMarkerProps {
  index: number;
  today: Date;
  rowHeight: number;
}

export function CurrentTimeMarker({ index, today, rowHeight }: CurrentTimeMarkerProps) {
  const fraction = (today.getHours() * 60 + today.getMinutes()) / (24 * 60);
  const left = index * MONTH.DAY_WIDTH + fraction * MONTH.DAY_WIDTH - 2;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top: MONTH.DAY_HEADER_HEIGHT,
        width: 4,
        height: rowHeight - MONTH.DAY_HEADER_HEIGHT,
        backgroundColor: Colors.WHITE,
        opacity: 0.85,
        borderRadius: 2,
      }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add src/ui/schedule/components/month/current-time-marker.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor(month): rewrite CurrentTimeMarker as Satori div"
```

---

## Task 13: Rewrite month/week-group.tsx

**Files:**
- Modify: `src/ui/schedule/components/month/week-group.tsx`

Removes `offsetY` (parent positions via flex column) and `baseId` (no longer needed without SVG clipPath). Becomes a `position: relative` div containing absolutely positioned day columns and span bars.

- [ ] **Step 1: Replace month/week-group.tsx**

```tsx
// src/ui/schedule/components/month/week-group.tsx
import { type WeekSpanBar } from "@/ui/layout";
import { isSameDay } from "@/common/utils/date-utils";
import { Colors } from "@/common/colors";
import { DayColumn } from "@/ui/schedule/components/month/day-column";
import { SpanBar } from "@/ui/schedule/components/month/span-bar";
import { CurrentTimeMarker } from "@/ui/schedule/components/month/current-time-marker";
import { MONTH } from "@/ui/schedule/components/month/constants";

interface WeekGroupProps {
  days: Date[];
  weekTimeline: WeekSpanBar[];
  today: Date;
  weekIndex: number;
  currentMonth: { year: number; month: number };
  showTodayMarker: boolean;
  columnBg: string;
  rowHeight: number;
}

export function WeekGroup({
  days,
  weekTimeline,
  today,
  weekIndex,
  currentMonth,
  showTodayMarker,
  columnBg,
  rowHeight,
}: WeekGroupProps) {
  const todayIndex = days.findIndex((day) => isSameDay(day, today));

  return (
    <div style={{ position: "relative", width: MONTH.WIDTH, height: rowHeight }}>
      {weekIndex > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: MONTH.WIDTH,
            height: 1,
            backgroundColor: Colors.SLATE,
          }}
        />
      )}
      {days.map((day, index) => (
        <DayColumn
          key={index}
          day={day}
          index={index}
          currentMonth={currentMonth}
          columnBg={columnBg}
          rowHeight={rowHeight}
        />
      ))}
      {weekTimeline.map((bar, index) => (
        <SpanBar key={index} bar={bar} />
      ))}
      {showTodayMarker && todayIndex >= 0 && (
        <CurrentTimeMarker index={todayIndex} today={today} rowHeight={rowHeight} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add src/ui/schedule/components/month/week-group.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor(month): rewrite WeekGroup as Satori div, remove offsetY and baseId"
```

---

## Task 14: Rewrite month/summary-block.tsx

**Files:**
- Modify: `src/ui/schedule/components/month/summary-block.tsx`

Removes `offsetY` (parent flex column handles positioning). Becomes a flex row with a left label column and right items column.

- [ ] **Step 1: Replace month/summary-block.tsx**

```tsx
// src/ui/schedule/components/month/summary-block.tsx
import { SUMMARY, summaryBlockHeight, formatDaysHours, formatMonthLabel } from "@/ui/layout";
import { Colors } from "@/common/colors";
import { MONTH } from "@/ui/schedule/components/month/constants";
import { OnCallSummary } from "@/domain/on-call-summary";

interface SummaryBlockProps {
  year: number;
  month: number;
  summary: OnCallSummary[];
}

export function SummaryBlock({ year, month, summary }: SummaryBlockProps) {
  if (summary.length === 0) return null;

  const monthLabel = formatMonthLabel({ year, month });
  const height = summaryBlockHeight(summary.length);

  return (
    <div
      tw="flex"
      style={{
        width: MONTH.WIDTH,
        height,
        borderRadius: 10,
        border: `1px solid ${Colors.SLATE}`,
        backgroundColor: Colors.DARK,
        overflow: "hidden",
      }}
    >
      <div
        tw="flex items-center"
        style={{
          width: SUMMARY.MONTH_COL_WIDTH,
          paddingLeft: 24,
          borderRight: `1px solid ${Colors.SLATE}`,
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, color: Colors.FROST, fontFamily: "Inter" }}>
          {monthLabel}
        </span>
      </div>
      <div
        tw="flex flex-col justify-center"
        style={{
          flex: 1,
          paddingTop: SUMMARY.VERTICAL_PADDING,
          paddingBottom: SUMMARY.VERTICAL_PADDING,
        }}
      >
        {summary.map(({ teamMember, email, hours, color }, index) => (
          <div
            key={index}
            tw="flex items-center"
            style={{ height: SUMMARY.VERTICAL_ROW_HEIGHT, paddingLeft: 20 }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: color,
                marginRight: 10,
              }}
            />
            <span
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: Colors.SUBTLE,
                flex: 1,
                fontFamily: "Inter",
              }}
            >
              {`${teamMember} - ${email}`}
            </span>
            <span style={{ fontSize: 15, color: Colors.DIM, paddingRight: 24, fontFamily: "Inter" }}>
              {formatDaysHours(hours)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add src/ui/schedule/components/month/summary-block.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor(month): rewrite SummaryBlock as Satori flex, remove offsetY"
```

---

## Task 15: Rewrite month/month-block.tsx

**Files:**
- Modify: `src/ui/schedule/components/month/month-block.tsx`

Removes `blockOffsetY` (parent flex column handles it). Becomes a bordered div with a header row and week-group children stacked vertically. Left/right borders use absolute divs since CSS `border` in Satori applies to all sides.

- [ ] **Step 1: Replace month/month-block.tsx**

```tsx
// src/ui/schedule/components/month/month-block.tsx
import { type WeekSpanBar, formatMonthLabel } from "@/ui/layout";
import { Colors } from "@/common/colors";
import { WeekGroup } from "@/ui/schedule/components/month/week-group";
import { MONTH } from "@/ui/schedule/components/month/constants";

interface MonthBlockProps {
  weeks: Date[][];
  blockHeight: number;
  today: Date;
  weekTimelines: WeekSpanBar[][];
  currentMonth: { year: number; month: number };
  showTodayMarker: boolean;
  columnBg: string;
  weekRowHeights: number[];
}

export function MonthBlock({
  weeks,
  blockHeight,
  today,
  weekTimelines,
  currentMonth,
  showTodayMarker,
  columnBg,
  weekRowHeights,
}: MonthBlockProps) {
  const monthLabel = formatMonthLabel(currentMonth);

  return (
    <div
      style={{
        position: "relative",
        width: MONTH.WIDTH,
        height: blockHeight,
        border: `1px solid ${Colors.SLATE}`,
        overflow: "hidden",
      }}
    >
      <div
        tw="flex items-center justify-center"
        style={{
          height: MONTH.BLOCK_HEADER_HEIGHT,
          borderBottom: `1px solid ${Colors.SLATE}`,
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 700, color: Colors.FROST, fontFamily: "Inter" }}>
          {monthLabel}
        </span>
      </div>
      {weeks.map((days, localIndex) => (
        <WeekGroup
          key={localIndex}
          days={days}
          weekTimeline={weekTimelines[localIndex]}
          today={today}
          weekIndex={localIndex}
          currentMonth={currentMonth}
          showTodayMarker={showTodayMarker}
          columnBg={columnBg}
          rowHeight={weekRowHeights[localIndex]}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add src/ui/schedule/components/month/month-block.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor(month): rewrite MonthBlock as Satori div, remove blockOffsetY"
```

---

## Task 16: Rewrite month-schedule.tsx (async root)

**Files:**
- Modify: `src/ui/schedule/components/month/month-schedule.tsx`

The root component becomes a flex column. Height is computed in `buildMonthViewSvg` (outside the component) for the `renderToSvg` call. The separator between months is a div. `OnCallPill` no longer takes `cy`. `SummaryBlock` no longer takes `offsetY`. `MonthBlock` no longer takes `blockOffsetY`.

- [ ] **Step 1: Replace month-schedule.tsx**

```tsx
// src/ui/schedule/components/month/month-schedule.tsx
import React, { Fragment } from "react";
import { addDays, startOfWeek, TimeWindow } from "@/common/utils/date-utils";
import { Colors } from "@/common/colors";
import { buildWeekSpanBars, summaryBlockHeight, weekRowHeight, LAYOUT } from "@/ui/layout";
import { OnCallEvent } from "@/domain/on-call-event";
import { MonthBlock } from "@/ui/schedule/components/month/month-block";
import { SummaryBlock } from "@/ui/schedule/components/month/summary-block";
import { ON_CALL_PILL_CIRC_R, OnCallPill } from "@/ui/schedule/components/on-call-pill";
import { MONTH } from "@/ui/schedule/components/month/constants";
import { OnCallUser } from "@/domain/user";
import { computeOnCallSummary } from "@/domain/on-call-summary";
import { renderToSvg } from "@/ui/schedule/satori-renderer";

type Props = {
  events: OnCallEvent[];
  window: TimeWindow;
  onCallUser?: OnCallUser;
};

const ON_CALL_PILL_BANNER = ON_CALL_PILL_CIRC_R * 2;

function buildMonthData(events: OnCallEvent[], window: TimeWindow) {
  const { start, end } = window;
  const firstWeekStart = startOfWeek(start);
  const lastWeekStart = startOfWeek(end);
  const allWeeks: Date[][] = [];

  for (let weekStart = firstWeekStart; weekStart <= lastWeekStart; weekStart = addDays(weekStart, 7)) {
    allWeeks.push(Array.from({ length: 7 }, (_, dayOffset) => addDays(weekStart, dayOffset)));
  }

  const monthsSeen = new Set<string>();
  const monthList: Array<{ year: number; month: number }> = [];

  for (const week of allWeeks) {
    for (const day of week) {
      if (day >= start && day <= end) {
        const key = `${day.getFullYear()}-${day.getMonth()}`;
        if (!monthsSeen.has(key)) {
          monthsSeen.add(key);
          monthList.push({ year: day.getFullYear(), month: day.getMonth() });
        }
      }
    }
  }

  const monthGroups = monthList.map(({ year, month }) => {
    const weeks = allWeeks.filter((week) => week.some((d) => d.getFullYear() === year && d.getMonth() === month));
    return { year, month, weeks };
  });

  const weekTimelinesByMonth = monthGroups.map(({ year, month, weeks }) =>
    weeks.map((days) => buildWeekSpanBars(days, events, { year, month })),
  );

  const weekRowHeightsByMonth = weekTimelinesByMonth.map((weekTimelines) =>
    weekTimelines.map((timeline) => weekRowHeight(Math.max(1, ...timeline.map((bar) => bar.lane + 1)))),
  );

  const summaries = monthGroups.map(({ year, month }) => computeOnCallSummary(events, year, month));

  return { monthGroups, weekTimelinesByMonth, weekRowHeightsByMonth, summaries };
}

function computeTotalHeight(
  monthGroups: ReturnType<typeof buildMonthData>["monthGroups"],
  weekRowHeightsByMonth: ReturnType<typeof buildMonthData>["weekRowHeightsByMonth"],
  summaries: ReturnType<typeof buildMonthData>["summaries"],
  topBannerHeight: number,
): number {
  const calendarHeight = (monthIndex: number) =>
    MONTH.BLOCK_HEADER_HEIGHT + weekRowHeightsByMonth[monthIndex].reduce((a, b) => a + b, 0);

  const monthTotalHeight = (monthIndex: number) =>
    calendarHeight(monthIndex) + MONTH.SUMMARY_GAP + summaryBlockHeight(summaries[monthIndex].length);

  return (
    topBannerHeight +
    monthGroups.reduce((acc, _, monthIndex) => acc + monthTotalHeight(monthIndex), 0) +
    (monthGroups.length - 1) * MONTH.BLOCK_GAP
  );
}

function CombinedScheduleRoot({ events, window, onCallUser }: Props) {
  const today = new Date();
  const showTodayMarker = !!onCallUser;
  const backgroundColor = onCallUser ? "transparent" : Colors.DARK;
  const columnBg = onCallUser ? Colors.DARK : "none";

  const { monthGroups, weekTimelinesByMonth, weekRowHeightsByMonth, summaries } = buildMonthData(events, window);

  const calendarHeight = (monthIndex: number) =>
    MONTH.BLOCK_HEADER_HEIGHT + weekRowHeightsByMonth[monthIndex].reduce((a, b) => a + b, 0);

  return (
    <div
      tw="flex flex-col"
      style={{ width: MONTH.WIDTH, backgroundColor }}
    >
      {onCallUser && <OnCallPill name={onCallUser.name} color={onCallUser.color} />}
      {monthGroups.map(({ year, month, weeks }, monthIndex) => (
        <Fragment key={monthIndex}>
          <MonthBlock
            weeks={weeks}
            blockHeight={calendarHeight(monthIndex)}
            today={today}
            weekTimelines={weekTimelinesByMonth[monthIndex]}
            currentMonth={{ year, month }}
            showTodayMarker={showTodayMarker}
            columnBg={columnBg}
            weekRowHeights={weekRowHeightsByMonth[monthIndex]}
          />
          <div style={{ height: MONTH.SUMMARY_GAP }} />
          <SummaryBlock year={year} month={month} summary={summaries[monthIndex]} />
          {monthIndex < monthGroups.length - 1 && (
            <>
              <div style={{ height: MONTH.BLOCK_GAP / 2 }} />
              <div style={{ width: MONTH.WIDTH, height: 2, backgroundColor: Colors.SLATE }} />
              <div style={{ height: MONTH.BLOCK_GAP / 2 }} />
            </>
          )}
        </Fragment>
      ))}
    </div>
  );
}

export async function buildMonthViewSvg(props: Props): Promise<string> {
  const topBannerHeight = props.onCallUser ? ON_CALL_PILL_BANNER : 0;
  const { monthGroups, weekRowHeightsByMonth, summaries } = buildMonthData(props.events, props.window);
  const totalHeight = computeTotalHeight(monthGroups, weekRowHeightsByMonth, summaries, topBannerHeight);
  return renderToSvg(<CombinedScheduleRoot {...props} />, MONTH.WIDTH, totalHeight);
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add src/ui/schedule/components/month/month-schedule.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor(month): rewrite CombinedScheduleRoot as Satori flex, make buildMonthViewSvg async"
```

---

## Task 17: Rewrite skeleton components

**Files:**
- Modify: `src/ui/schedule/components/week/week-row.tsx`
- Modify: `src/ui/schedule/skeleton/schedule.tsx`

`WeekRow` shifts from SVG rects to absolute divs. The skeleton root becomes a flex column of two blocks.

- [ ] **Step 1: Replace week-row.tsx**

```tsx
// src/ui/schedule/components/week/week-row.tsx
import { LAYOUT } from "@/ui/layout";
import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";

interface WeekRowProps {
  weekIndex: number;
  spans: Array<{ start: number; end: number }>;
  rowHeight: number;
}

export function WeekRow({ weekIndex, spans, rowHeight }: WeekRowProps) {
  return (
    <div style={{ position: "relative", width: LAYOUT.WIDTH, height: rowHeight }}>
      {weekIndex > 0 && (
        <div style={{ position: "absolute", top: 0, left: 0, width: LAYOUT.WIDTH, height: 1, backgroundColor: SKELETON_COLOR }} />
      )}
      {Array.from({ length: 7 }, (_, dayIndex) => {
        const left = dayIndex * LAYOUT.DAY_WIDTH;
        return (
          <div key={dayIndex}>
            <div
              style={{
                position: "absolute",
                left,
                top: 0,
                width: 1,
                height: rowHeight,
                backgroundColor: SKELETON_COLOR,
              }}
            />
            <div
              style={{
                position: "absolute",
                left,
                top: LAYOUT.DAY_HEADER_HEIGHT,
                width: LAYOUT.DAY_WIDTH,
                height: 1,
                backgroundColor: SKELETON_COLOR,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: left + LAYOUT.DAY_WIDTH / 2 - 20,
                top: 5,
                width: 39,
                height: 15,
                backgroundColor: SKELETON_COLOR,
                borderRadius: 2,
              }}
            />
          </div>
        );
      })}
      {spans.map(({ start, end }, index) => {
        const barLeft = start * LAYOUT.DAY_WIDTH + LAYOUT.H_GAP;
        const barWidth = (end - start) * LAYOUT.DAY_WIDTH - 2 * LAYOUT.H_GAP;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: barLeft,
              top: LAYOUT.ROW_TOP,
              width: barWidth,
              height: LAYOUT.ROW_HEIGHT,
              borderRadius: 6,
              backgroundColor: SKELETON_COLOR,
            }}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Replace skeleton/schedule.tsx**

```tsx
// src/ui/schedule/skeleton/schedule.tsx
import React from "react";
import { LAYOUT, SUMMARY, weekRowHeight, summaryBlockHeight } from "@/ui/layout";
import { ON_CALL_PILL_CIRC_R } from "@/ui/schedule/components/on-call-pill";
import { WeekRow } from "@/ui/schedule/components/week/week-row";
import { SKELETON_COLOR } from "@/ui/schedule/skeleton/colors/skeleton-colors";
import { renderToSvg } from "@/ui/schedule/satori-renderer";

const ON_CALL_PILL_BANNER = ON_CALL_PILL_CIRC_R * 2;

const NUM_WEEKS = 5;
const NUM_SUMMARY = 3;

const WEEK_BAR_SPANS = [
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
  [{ start: 0, end: 7 }],
];

function ScheduleSkeletonRoot() {
  const rowHeight = weekRowHeight(1);
  const calendarHeight = LAYOUT.BLOCK_HEADER_HEIGHT + NUM_WEEKS * rowHeight;
  const summaryHeight = summaryBlockHeight(NUM_SUMMARY);

  return (
    <div tw="flex flex-col" style={{ width: LAYOUT.WIDTH }}>
      <div style={{ height: ON_CALL_PILL_BANNER }} />
      {/* Calendar block — background at 20% opacity, inner elements at full opacity */}
      <div style={{ position: "relative", width: LAYOUT.WIDTH, height: calendarHeight, borderRadius: 10, border: `1px solid ${SKELETON_COLOR}` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 10, backgroundColor: "rgba(40,53,78,0.2)" }} />
        <div
          style={{
            position: "absolute",
            left: LAYOUT.WIDTH / 2 - 80,
            top: 13,
            width: 160,
            height: 18,
            backgroundColor: SKELETON_COLOR,
            borderRadius: 4,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: LAYOUT.BLOCK_HEADER_HEIGHT,
            left: 0,
            width: LAYOUT.WIDTH,
            height: 1,
            backgroundColor: SKELETON_COLOR,
          }}
        />
        {Array.from({ length: NUM_WEEKS }, (_, weekIndex) => (
          <WeekRow key={weekIndex} weekIndex={weekIndex} spans={WEEK_BAR_SPANS[weekIndex]} rowHeight={rowHeight} />
        ))}
      </div>
      <div style={{ height: LAYOUT.SUMMARY_GAP }} />
      {/* Summary block — same pattern */}
      <div style={{ position: "relative", width: LAYOUT.WIDTH, height: summaryHeight, borderRadius: 10, border: `1px solid ${SKELETON_COLOR}` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 10, backgroundColor: "rgba(40,53,78,0.2)" }} />
        <div
          style={{
            position: "absolute",
            left: 24,
            top: summaryHeight / 2 - 5,
            width: 90,
            height: 14,
            backgroundColor: SKELETON_COLOR,
            borderRadius: 3,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: SUMMARY.MONTH_COL_WIDTH,
            top: 16,
            width: 1,
            height: summaryHeight - 32,
            backgroundColor: SKELETON_COLOR,
          }}
        />
      </div>
    </div>
  );
}

export async function buildScheduleSkeletonSvg(): Promise<string> {
  const rowHeight = weekRowHeight(1);
  const calendarHeight = LAYOUT.BLOCK_HEADER_HEIGHT + NUM_WEEKS * rowHeight;
  const summaryHeight = summaryBlockHeight(NUM_SUMMARY);
  const totalHeight = ON_CALL_PILL_BANNER + calendarHeight + LAYOUT.SUMMARY_GAP + summaryHeight;
  return renderToSvg(<ScheduleSkeletonRoot />, LAYOUT.WIDTH, totalHeight);
}
```

- [ ] **Step 3: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add \
  src/ui/schedule/components/week/week-row.tsx \
  src/ui/schedule/skeleton/schedule.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor(skeleton): rewrite WeekRow and ScheduleSkeleton as Satori divs"
```

---

## Task 18: Make schedule-renderer.ts async

**Files:**
- Modify: `src/ui/schedule/schedule-renderer.ts`

`renderSchedule` becomes `async` — all three builders now return `Promise<string>`.

- [ ] **Step 1: Replace schedule-renderer.ts**

```typescript
// src/ui/schedule/schedule-renderer.ts
import { OnCallEvent } from "@/domain/on-call-event";
import { OnCallUser } from "@/domain/user";
import { TimeRange } from "@/domain/time-range";
import { toSvgDataUri } from "@/common/utils/svg-utils";
import { buildWeekViewSvg } from "@/ui/schedule/components/week/week-schedule";
import { buildMonthViewSvg } from "@/ui/schedule/components/month/month-schedule";
import { buildScheduleSkeletonSvg } from "@/ui/schedule/skeleton/schedule";
import { TimeWindow } from "@/common/utils/date-utils";

type ScheduleData = {
  events: OnCallEvent[];
  onCallUser: OnCallUser | undefined;
  window: TimeWindow;
  timeRange: TimeRange;
  isLoading: boolean;
};

export async function renderSchedule({ events, onCallUser, window, timeRange, isLoading }: ScheduleData): Promise<string> {
  if (isLoading) return `![schedule](${toSvgDataUri(await buildScheduleSkeletonSvg())})`;

  const svg =
    timeRange === TimeRange.WEEK
      ? await buildWeekViewSvg({ events, window, onCallUser })
      : await buildMonthViewSvg({ events, window, onCallUser });

  return `![schedule](${toSvgDataUri(svg)})`;
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add src/ui/schedule/schedule-renderer.ts
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor: make renderSchedule async"
```

---

## Task 19: Update on-call-schedule.tsx for async rendering

**Files:**
- Modify: `src/on-call-schedule.tsx`

`renderSchedule` now returns `Promise<string>`, so it cannot be called directly during render. The component gains a `markdown` state initialized to `""` and a `useEffect` that resolves the promise and updates state whenever the inputs change. The `copyAsPng` function also awaits the now-async builders.

- [ ] **Step 1: Replace on-call-schedule.tsx**

```tsx
// src/on-call-schedule.tsx
import { Detail, environment, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import * as os from "node:os";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getCurrentMonthWindow, getCurrentWeekWindow, TimeWindow } from "@/common/utils/date-utils";
import { buildMonthViewSvg } from "@/ui/schedule/components/month/month-schedule";
import { useOnCallData } from "@/hooks/use-on-call-data";
import { buildWeekViewSvg } from "@/ui/schedule/components/week/week-schedule";
import { exportSvgToClipboard } from "@/common/utils/svg-utils";
import { formatUserName } from "@/domain/user";
import { TimeRange } from "@/domain/time-range";
import { getOnCallUser, OnCallEvent } from "@/domain/on-call-event";
import { renderSchedule } from "@/ui/schedule/schedule-renderer";
import { ScheduleActionPanel } from "@/ui/schedule/components/action-panel/schedule-action-panel";

const { WEEK } = TimeRange;

const NO_PRIMARY_SCHEDULE_ERROR_MESSAGE = "## No 'Primary' on-call schedule found in your BetterStack account.";
const SCHEDULE_LOAD_ERROR_TITLE = "## Failed to load on-call schedule";
const SCHEDULE_LOAD_ERROR_MESSAGE = "Check your API token and network connection, then reopen the extension.";

const queryClient = new QueryClient();

function OnCallSchedule() {
  const { events, scheduleName, isLoading, isEmpty, hasError } = useOnCallData();
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.MONTH);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [offset, setOffset] = useState<number>(0);
  const [markdown, setMarkdown] = useState<string>("");

  function handleTimeRangeChange(range: TimeRange) {
    setTimeRange(range);
    setOffset(0);
  }

  if (hasError) {
    return <Detail markdown={[SCHEDULE_LOAD_ERROR_TITLE, SCHEDULE_LOAD_ERROR_MESSAGE].join(os.EOL)} />;
  }

  if (isEmpty) {
    return <Detail markdown={NO_PRIMARY_SCHEDULE_ERROR_MESSAGE} />;
  }

  const userNames = [...new Set(events.map((event) => formatUserName(event.user)))].toSorted();
  const filteredEvents = selectedUser ? events.filter((event) => formatUserName(event.user) === selectedUser) : events;
  const onCallUser = getOnCallUser(events);
  const window = timeRange === TimeRange.WEEK ? getCurrentWeekWindow(offset) : getCurrentMonthWindow(offset);

  useEffect(() => {
    let cancelled = false;
    renderSchedule({ events: filteredEvents, onCallUser, window, timeRange, isLoading }).then((result) => {
      if (!cancelled) setMarkdown(result);
    });
    return () => {
      cancelled = true;
    };
  }, [filteredEvents, onCallUser, window, timeRange, isLoading]);

  return (
    <Detail
      isLoading={isLoading || markdown === ""}
      navigationTitle={selectedUser ? `${scheduleName} — ${selectedUser}` : scheduleName}
      markdown={markdown}
      actions={
        <ScheduleActionPanel
          currentTimeRange={timeRange}
          offset={offset}
          userNames={userNames}
          selectedUser={selectedUser}
          onTimeRangeChange={handleTimeRangeChange}
          onOffsetChange={setOffset}
          onUserSelect={setSelectedUser}
          onCopyAsPng={() => copyAsPng({ timeRange, events: filteredEvents, window })}
        />
      }
    />
  );
}

async function copyAsPng(props: { timeRange: TimeRange; events: OnCallEvent[]; window: TimeWindow }) {
  const { timeRange, events, window } = props;
  const toast = await showToast({ style: Toast.Style.Animated, title: "Copying to clipboard…" });

  try {
    const svg = timeRange === WEEK ? await buildWeekViewSvg({ events, window }) : await buildMonthViewSvg({ events, window });
    await exportSvgToClipboard(svg, environment.supportPath);
    toast.style = Toast.Style.Success;
    toast.title = "Schedule copied";
  } catch (error) {
    toast.style = Toast.Style.Failure;
    toast.title = "Failed to copy schedule";
    toast.message = error instanceof Error ? error.message : String(error);
  }
}

export default function Command() {
  return (
    <QueryClientProvider client={queryClient}>
      <OnCallSchedule />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add src/on-call-schedule.tsx
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "refactor: resolve async renderSchedule via useEffect in OnCallSchedule"
```

---

## Task 20: Remove react-dom/server and verify the build

**Files:**
- No new files; verify all `renderToStaticMarkup` imports are gone

- [ ] **Step 1: Confirm no remaining react-dom/server imports**

```bash
grep -r "react-dom/server" /Users/davidmolinero/dev/raycast-betterstack/src/
```

Expected: no output. If any file still imports `renderToStaticMarkup`, remove it.

- [ ] **Step 2: Run the TypeScript type check**

```bash
cd /Users/davidmolinero/dev/raycast-betterstack && npm run ts:check
```

Expected: exits 0 with no type errors. Fix any errors before proceeding.

- [ ] **Step 3: Run the Raycast build**

```bash
cd /Users/davidmolinero/dev/raycast-betterstack && npm run build
```

Expected: `Building extension` completes without errors and `dist/` is populated.

- [ ] **Step 4: Commit**

```bash
git -C /Users/davidmolinero/dev/raycast-betterstack add -A
git -C /Users/davidmolinero/dev/raycast-betterstack commit -m "chore: remove react-dom/server, complete Satori + satori-tailwind migration"
```
