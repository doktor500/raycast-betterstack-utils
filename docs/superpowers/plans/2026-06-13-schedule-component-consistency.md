# Schedule Component Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align `month/` and `week/` schedule component directories to use consistent naming, component granularity, and constants access patterns — no visual or behavioral changes.

**Architecture:** Five sequential tasks: (1) add `month/constants.ts`, (2) migrate month components to `MONTH.*`, (3) rename `TodayMarker→CurrentTimeMarker`, (4) extract singular `DayColumn` in week, (5) extract singular `EventSegment` in week. Each task ends with a type-check and commit.

**Tech Stack:** TypeScript, React (SVG components), Raycast extension — no test framework; use `npm run ts:check` for verification.

---

### Task 1: Create `month/constants.ts`

**Files:**
- Create: `src/ui/schedule/components/month/constants.ts`

- [ ] **Step 1: Create the constants file**

`src/ui/schedule/components/month/constants.ts`:
```ts
import { LAYOUT } from "../../../layout";

export const MONTH = {
  WIDTH: LAYOUT.WIDTH,
  BLOCK_GAP: LAYOUT.BLOCK_GAP,
  BLOCK_HEADER_HEIGHT: LAYOUT.BLOCK_HEADER_HEIGHT,
  DAY_WIDTH: LAYOUT.DAY_WIDTH,
  DAY_HEADER_HEIGHT: LAYOUT.DAY_HEADER_HEIGHT,
  H_GAP: LAYOUT.H_GAP,
  ROW_TOP: LAYOUT.ROW_TOP,
  ROW_HEIGHT: LAYOUT.ROW_HEIGHT,
  BAR_GAP: LAYOUT.BAR_GAP,
  SUMMARY_GAP: LAYOUT.SUMMARY_GAP,
} as const;
```

- [ ] **Step 2: Verify types**

Run: `npm run ts:check`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/ui/schedule/components/month/constants.ts
git commit -m "feat(month): add MONTH.* constants namespace"
```

---

### Task 2: Migrate month components to `MONTH.*`

**Files:**
- Modify: `src/ui/schedule/components/month/month-block.tsx`
- Modify: `src/ui/schedule/components/month/week-group.tsx`
- Modify: `src/ui/schedule/components/month/day-column.tsx`
- Modify: `src/ui/schedule/components/month/span-bar.tsx`
- Modify: `src/ui/schedule/components/month/summary-block.tsx`
- Modify: `src/ui/schedule/components/month/month-schedule.tsx`
- Modify: `src/ui/schedule/components/month/today-marker.tsx`

- [ ] **Step 1: Update `month-block.tsx`**

```tsx
import { type WeekSpanBar, formatMonthLabel } from "../../../layout";
import { FONT_FAMILY } from "../../../../common/font";
import { Colors } from "../../../../common/colors";
import { WeekGroup } from "./week-group";
import { MONTH } from "./constants";

interface MonthBlockProps {
  weeks: Date[][];
  blockOffsetY: number;
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
  blockOffsetY,
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
    <g transform={`translate(0, ${blockOffsetY})`}>
      <text
        x={MONTH.WIDTH / 2}
        y={MONTH.BLOCK_HEADER_HEIGHT / 2 + 7}
        textAnchor="middle"
        fill={Colors.FROST}
        fontFamily={FONT_FAMILY}
        fontSize={17}
        fontWeight={700}
      >
        {monthLabel}
      </text>
      <line x1={0.5} y1={MONTH.BLOCK_HEADER_HEIGHT} x2={0.5} y2={blockHeight} stroke={Colors.BORDER} />
      <line
        x1={MONTH.WIDTH - 0.5}
        y1={MONTH.BLOCK_HEADER_HEIGHT}
        x2={MONTH.WIDTH - 0.5}
        y2={blockHeight}
        stroke={Colors.BORDER}
      />
      <line
        x1={0}
        y1={MONTH.BLOCK_HEADER_HEIGHT}
        x2={MONTH.WIDTH}
        y2={MONTH.BLOCK_HEADER_HEIGHT}
        stroke={Colors.BORDER}
      />
      {weeks.map((days, localIndex) => {
        const rowHeight = weekRowHeights[localIndex];
        const offsetY = MONTH.BLOCK_HEADER_HEIGHT + weekRowHeights.slice(0, localIndex).reduce((a, b) => a + b, 0);
        const baseId = (currentMonth.year * 12 + currentMonth.month) * 1000 + localIndex * 100;
        return (
          <WeekGroup
            key={localIndex}
            days={days}
            weekTimeline={weekTimelines[localIndex]}
            today={today}
            weekIndex={localIndex}
            offsetY={offsetY}
            currentMonth={currentMonth}
            showTodayMarker={showTodayMarker}
            columnBg={columnBg}
            rowHeight={rowHeight}
            baseId={baseId}
          />
        );
      })}
    </g>
  );
}
```

- [ ] **Step 2: Update `week-group.tsx`**

```tsx
import { type WeekSpanBar } from "../../../layout";
import { isSameDay } from "../../../../common/dates";
import { Colors } from "../../../../common/colors";
import { DayColumn } from "./day-column";
import { SpanBar } from "./span-bar";
import { TodayMarker } from "./today-marker";
import { MONTH } from "./constants";

interface WeekGroupProps {
  days: Date[];
  weekTimeline: WeekSpanBar[];
  today: Date;
  weekIndex: number;
  offsetY: number;
  currentMonth: { year: number; month: number };
  showTodayMarker: boolean;
  columnBg: string;
  rowHeight: number;
  baseId: number;
}

export function WeekGroup({
  days,
  weekTimeline,
  today,
  weekIndex,
  offsetY,
  currentMonth,
  showTodayMarker,
  columnBg,
  rowHeight,
  baseId,
}: WeekGroupProps) {
  const todayIndex = days.findIndex((day) => isSameDay(day, today));

  return (
    <g transform={`translate(0, ${offsetY})`}>
      {weekIndex > 0 && <line x1={0} y1={0} x2={MONTH.WIDTH} y2={0} stroke={Colors.BORDER} />}
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
        <SpanBar key={index} bar={bar} clipId={baseId + index} />
      ))}
      {showTodayMarker && todayIndex >= 0 && <TodayMarker index={todayIndex} today={today} rowHeight={rowHeight} />}
    </g>
  );
}
```

- [ ] **Step 3: Update `day-column.tsx`**

```tsx
import { formatWeekday } from "../../../layout";
import { FONT_FAMILY } from "../../../../common/font";
import { Colors } from "../../../../common/colors";
import { MONTH } from "./constants";

interface DayColumnProps {
  day: Date;
  index: number;
  currentMonth: { year: number; month: number };
  columnBg: string;
  rowHeight: number;
}

export function DayColumn({ day, index, currentMonth, columnBg, rowHeight }: DayColumnProps) {
  const x = index * MONTH.DAY_WIDTH;
  const center = x + MONTH.DAY_WIDTH / 2;
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  const inMonth = day.getFullYear() === currentMonth.year && day.getMonth() === currentMonth.month;
  const bgRect =
    columnBg !== "none" ? <rect x={x} y={0} width={MONTH.DAY_WIDTH} height={rowHeight} fill={columnBg} /> : null;

  if (!inMonth) {
    return (
      <g>
        {bgRect}
        {isWeekend && <rect x={x} y={0} width={MONTH.DAY_WIDTH} height={rowHeight} fill="url(#hatch)" opacity={0.3} />}
      </g>
    );
  }

  return (
    <g>
      {bgRect}
      {isWeekend && <rect x={x} y={0} width={MONTH.DAY_WIDTH} height={rowHeight} fill="url(#hatch)" />}
      <line x1={x} y1={0} x2={x} y2={rowHeight} stroke={Colors.DIVIDER} />
      <line
        x1={x}
        y1={MONTH.DAY_HEADER_HEIGHT}
        x2={x + MONTH.DAY_WIDTH}
        y2={MONTH.DAY_HEADER_HEIGHT}
        stroke={Colors.HEADER_LINE}
      />
      <text
        x={center - 3}
        y={22}
        textAnchor="end"
        fill={Colors.MUTED}
        fontFamily={FONT_FAMILY}
        fontSize={13}
        fontWeight={600}
      >
        {formatWeekday(day)}
      </text>
      <text
        x={center + 3}
        y={22}
        textAnchor="start"
        fill={Colors.SUBTLE}
        fontFamily={FONT_FAMILY}
        fontSize={16}
        fontWeight={600}
      >
        {day.getDate()}
      </text>
    </g>
  );
}
```

- [ ] **Step 4: Update `span-bar.tsx`**

```tsx
import { type WeekSpanBar, truncateLabel } from "../../../layout";
import { FONT_FAMILY } from "../../../../common/font";
import { getTextColor } from "../../../../common/colors";
import { MONTH } from "./constants";

interface SpanBarProps {
  bar: WeekSpanBar;
  clipId: number;
}

export function SpanBar({ bar, clipId }: SpanBarProps) {
  const leftX = bar.startDayIndex * MONTH.DAY_WIDTH + bar.startFraction * MONTH.DAY_WIDTH;
  const rightX = bar.endDayIndex * MONTH.DAY_WIDTH + bar.endFraction * MONTH.DAY_WIDTH;
  const barX = leftX + MONTH.H_GAP;
  const barWidth = Math.max(rightX - leftX - 2 * MONTH.H_GAP, 2);
  const barY = MONTH.ROW_TOP + bar.lane * (MONTH.ROW_HEIGHT + MONTH.BAR_GAP);
  const id = `bar-${clipId}`;
  const textColor = getTextColor(bar.color);
  const fontSize = 19;
  const rx = Math.min(6, Math.floor(barWidth / 3));
  const textAvailWidth = barWidth - 22;
  const label = textAvailWidth > 15 ? truncateLabel(bar.label, textAvailWidth, fontSize) : "";

  return (
    <g>
      <clipPath id={id}>
        <rect x={barX + 10} y={barY} width={Math.max(barWidth - 20, 1)} height={MONTH.ROW_HEIGHT} />
      </clipPath>
      <rect
        x={barX}
        y={barY}
        width={barWidth}
        height={MONTH.ROW_HEIGHT}
        rx={rx}
        fill={bar.color}
        filter="url(#shadow)"
      />
      <rect
        x={barX + 1}
        y={barY + 1}
        width={barWidth - 2}
        height={MONTH.ROW_HEIGHT - 2}
        rx={Math.max(rx - 1, 0)}
        fill="none"
        stroke={textColor}
        strokeOpacity={0.16}
      />
      {label && (
        <text
          x={barX + 12}
          y={barY + 27}
          clipPath={`url(#${id})`}
          fill={textColor}
          fontFamily={FONT_FAMILY}
          fontSize={fontSize}
          fontWeight={600}
          textRendering="geometricPrecision"
        >
          {label}
        </text>
      )}
    </g>
  );
}
```

- [ ] **Step 5: Update `summary-block.tsx`**

```tsx
import {
  type SummaryEntry,
  SUMMARY,
  summaryBlockHeight,
  formatDaysHours,
  formatMonthLabel,
} from "../../../layout";
import { FONT_FAMILY } from "../../../../common/font";
import { Colors } from "../../../../common/colors";
import { MONTH } from "./constants";

interface SummaryBlockProps {
  year: number;
  month: number;
  summary: SummaryEntry[];
  offsetY: number;
}

interface VerticalItemsProps {
  summary: SummaryEntry[];
}

function VerticalSummaryItems({ summary }: VerticalItemsProps) {
  const dotRadius = 6;
  const rowHeight = SUMMARY.VERTICAL_ROW_HEIGHT;
  const paddingY = SUMMARY.VERTICAL_PADDING;
  const dotX = SUMMARY.MONTH_COL_WIDTH + 20;

  return (
    <>
      {summary.map(({ name, hours, color }, index) => {
        const cy = paddingY + index * rowHeight + rowHeight / 2;
        const textX = dotX + dotRadius + 10;
        return (
          <g key={index}>
            <circle cx={dotX} cy={cy} r={dotRadius} fill={color} />
            <text x={textX} y={cy + 5} fill={Colors.SUBTLE} fontFamily={FONT_FAMILY} fontSize={17} fontWeight={600}>
              {name}
            </text>
            <text
              x={MONTH.WIDTH - 24}
              y={cy + 5}
              textAnchor="end"
              fill={Colors.MUTED}
              fontFamily={FONT_FAMILY}
              fontSize={15}
            >
              {formatDaysHours(hours)}
            </text>
          </g>
        );
      })}
    </>
  );
}

export function SummaryBlock({ year, month, summary, offsetY }: SummaryBlockProps) {
  if (summary.length === 0) return null;

  const monthLabel = formatMonthLabel({ year, month });
  const count = summary.length;
  const height = summaryBlockHeight(count);
  const midY = height / 2;

  return (
    <g transform={`translate(0, ${offsetY})`}>
      <rect width={MONTH.WIDTH} height={height} rx={10} fill={Colors.DARK} fillOpacity={0.2} />
      <rect x={0.5} y={0.5} width={MONTH.WIDTH - 1} height={height - 1} rx={10} fill="none" stroke={Colors.BORDER} />
      <text x={24} y={midY + 7} fill={Colors.FROST} fontFamily={FONT_FAMILY} fontSize={18} fontWeight={700}>
        {monthLabel}
      </text>
      <line x1={SUMMARY.MONTH_COL_WIDTH} y1={16} x2={SUMMARY.MONTH_COL_WIDTH} y2={height - 16} stroke={Colors.BORDER} />
      <VerticalSummaryItems summary={summary} />
    </g>
  );
}
```

- [ ] **Step 6: Update `month-schedule.tsx`**

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import path from "node:path";
import { Fragment } from "react";
import { addDays, startOfWeek } from "../../../../common/dates";
import { buildColorMap, Colors, RotaColors } from "../../../../common/colors";
import { buildWeekSpanBars, computeMonthSummary, summaryBlockHeight, weekRowHeight, formatMonthLabel } from "../../../layout";
import { formatUserName, OnCallEvent } from "../../../../domain/on-call-event";
import { MonthBlock } from "./month-block";
import { SummaryBlock } from "./summary-block";
import { ON_CALL_PILL_CIRC_R, OnCallPill } from "../on-call-pill";
import { MONTH } from "./constants";

type Props = {
  events: OnCallEvent[];
  today: Date;
  window: { start: Date; end: Date };
  backgroundColor?: string;
  showTodayMarker?: boolean;
  showOnCallPill?: boolean;
  allEvents?: OnCallEvent[];
};

const ON_CALL_PILL_BANNER = ON_CALL_PILL_CIRC_R * 2;

function findOnCallAtTime(
  date: Date,
  events: OnCallEvent[],
  colorMap: Map<string, string>,
): { name: string; color: string } | null {
  const dateMs = date.getTime();
  const event = events.find(
    (e) => new Date(e.started_at).getTime() <= dateMs && new Date(e.ended_at).getTime() > dateMs,
  );
  if (!event) return null;
  const name = formatUserName(event.user);
  return { name, color: colorMap.get(name) ?? RotaColors.GREEN };
}

function CombinedScheduleSvg({
  events,
  today,
  window,
  backgroundColor,
  showTodayMarker = true,
  showOnCallPill = true,
  allEvents,
}: Props) {
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

  const monthGroups = monthList.map(({ year, month }) => ({
    year,
    month,
    weeks: allWeeks.filter((days) => days.some((day) => day.getFullYear() === year && day.getMonth() === month)),
  }));

  const colorSourceEvents = allEvents ?? events;
  const uniqueNames = [...new Set(colorSourceEvents.map((event) => formatUserName(event.user)))].sort();
  const colorMap = buildColorMap(uniqueNames);

  const weekTimelinesByMonth = monthGroups.map(({ year, month, weeks }) =>
    weeks.map((days) => buildWeekSpanBars(days, events, { year, month }, colorMap)),
  );

  const weekRowHeightsByMonth = weekTimelinesByMonth.map((weekTimelines) =>
    weekTimelines.map((weekTimeline) => {
      const maxLanes = Math.max(1, ...weekTimeline.map((bar) => bar.lane + 1));
      return weekRowHeight(maxLanes);
    }),
  );

  const calendarHeight = (monthIndex: number) =>
    MONTH.BLOCK_HEADER_HEIGHT + weekRowHeightsByMonth[monthIndex].reduce((sum, height) => sum + height, 0);

  const summaries = monthGroups.map(({ year, month }) => computeMonthSummary(year, month, events, colorMap));

  const monthOnCall = monthGroups.map(() => {
    if (!showOnCallPill) return null;
    return findOnCallAtTime(today, allEvents ?? events, colorMap);
  });

  const currentMonthOnCall = monthOnCall.find((m) => m !== null) ?? null;
  const topBannerHeight = currentMonthOnCall ? ON_CALL_PILL_BANNER : 0;

  const monthTotalHeight = (monthIndex: number) =>
    calendarHeight(monthIndex) + MONTH.SUMMARY_GAP + summaryBlockHeight(summaries[monthIndex].length);

  const totalHeight =
    topBannerHeight +
    monthGroups.reduce((sum, _group, monthIndex) => sum + monthTotalHeight(monthIndex), 0) +
    (monthGroups.length - 1) * MONTH.BLOCK_GAP;

  const columnBg = backgroundColor ?? "none";

  let currentY = topBannerHeight;
  const monthOffsets = monthGroups.map((_, monthIndex) => {
    const offsetY = currentY;
    currentY += monthTotalHeight(monthIndex) + MONTH.BLOCK_GAP;
    return offsetY;
  });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={MONTH.WIDTH}
      height={totalHeight}
      viewBox={`0 0 ${MONTH.WIDTH} ${totalHeight}`}
    >
      <defs>
        <pattern id="hatch" width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
          {columnBg !== "none" && <rect width={8} height={8} fill={columnBg} />}
          <path d="M 0 0 L 0 8" stroke={Colors.NAVY} strokeWidth={1} opacity={0.5} />
        </pattern>
        <filter id="shadow" x="-10%" y="-30%" width="120%" height="170%">
          <feDropShadow dx={0} dy={2} stdDeviation={2} floodColor={Colors.VOID} floodOpacity={0.3} />
        </filter>
      </defs>
      {backgroundColor && <rect width={MONTH.WIDTH} height={totalHeight} fill={backgroundColor} />}
      {currentMonthOnCall && (
        <OnCallPill
          cy={Math.round(topBannerHeight / 2)}
          name={currentMonthOnCall.name}
          color={currentMonthOnCall.color}
        />
      )}
      {monthGroups.map(({ year, month, weeks }, monthIndex) => (
        <Fragment key={monthIndex}>
          <MonthBlock
            weeks={weeks}
            blockOffsetY={monthOffsets[monthIndex]}
            blockHeight={calendarHeight(monthIndex)}
            today={today}
            weekTimelines={weekTimelinesByMonth[monthIndex]}
            currentMonth={{ year, month }}
            showTodayMarker={showTodayMarker}
            columnBg={columnBg}
            weekRowHeights={weekRowHeightsByMonth[monthIndex]}
          />
          <SummaryBlock
            year={year}
            month={month}
            summary={summaries[monthIndex]}
            offsetY={monthOffsets[monthIndex] + calendarHeight(monthIndex) + MONTH.SUMMARY_GAP}
          />
          {monthIndex < monthGroups.length - 1 && (
            <line
              x1={0}
              y1={monthOffsets[monthIndex] + monthTotalHeight(monthIndex) + MONTH.BLOCK_GAP / 2}
              x2={MONTH.WIDTH}
              y2={monthOffsets[monthIndex] + monthTotalHeight(monthIndex) + MONTH.BLOCK_GAP / 2}
              stroke={Colors.SEPARATOR}
              strokeWidth={2}
            />
          )}
        </Fragment>
      ))}
    </svg>
  );
}

export function buildMonthViewSvg(props: Props): string {
  return renderToStaticMarkup(<CombinedScheduleSvg {...props} />);
}
```

- [ ] **Step 7: Update `today-marker.tsx`**

```tsx
import { Colors } from "../../../../common/colors";
import { MONTH } from "./constants";

interface TodayMarkerProps {
  index: number;
  today: Date;
  rowHeight: number;
}

export function TodayMarker({ index, today, rowHeight }: TodayMarkerProps) {
  const fraction = (today.getHours() * 60 + today.getMinutes()) / (24 * 60);
  const x = index * MONTH.DAY_WIDTH + fraction * MONTH.DAY_WIDTH;

  return (
    <g>
      <line
        x1={x}
        y1={MONTH.DAY_HEADER_HEIGHT}
        x2={x}
        y2={rowHeight}
        stroke={Colors.WHITE}
        strokeWidth={4}
        opacity={0.85}
      />
      <circle cx={x} cy={MONTH.DAY_HEADER_HEIGHT} r={3} fill={Colors.WHITE} />
    </g>
  );
}
```

- [ ] **Step 8: Verify types**

Run: `npm run ts:check`
Expected: no errors

- [ ] **Step 9: Commit**

```bash
git add src/ui/schedule/components/month/month-block.tsx \
        src/ui/schedule/components/month/week-group.tsx \
        src/ui/schedule/components/month/day-column.tsx \
        src/ui/schedule/components/month/span-bar.tsx \
        src/ui/schedule/components/month/summary-block.tsx \
        src/ui/schedule/components/month/month-schedule.tsx \
        src/ui/schedule/components/month/today-marker.tsx
git commit -m "refactor(month): replace LAYOUT.* with MONTH.* across all month components"
```

---

### Task 3: Rename `TodayMarker` → `CurrentTimeMarker`

**Files:**
- Rename: `src/ui/schedule/components/month/today-marker.tsx` → `src/ui/schedule/components/month/current-time-marker.tsx`
- Modify: `src/ui/schedule/components/month/week-group.tsx`

- [ ] **Step 1: Rename the file**

```bash
git mv src/ui/schedule/components/month/today-marker.tsx src/ui/schedule/components/month/current-time-marker.tsx
```

- [ ] **Step 2: Update component and interface names in `current-time-marker.tsx`**

```tsx
import { Colors } from "../../../../common/colors";
import { MONTH } from "./constants";

interface CurrentTimeMarkerProps {
  index: number;
  today: Date;
  rowHeight: number;
}

export function CurrentTimeMarker({ index, today, rowHeight }: CurrentTimeMarkerProps) {
  const fraction = (today.getHours() * 60 + today.getMinutes()) / (24 * 60);
  const x = index * MONTH.DAY_WIDTH + fraction * MONTH.DAY_WIDTH;

  return (
    <g>
      <line
        x1={x}
        y1={MONTH.DAY_HEADER_HEIGHT}
        x2={x}
        y2={rowHeight}
        stroke={Colors.WHITE}
        strokeWidth={4}
        opacity={0.85}
      />
      <circle cx={x} cy={MONTH.DAY_HEADER_HEIGHT} r={3} fill={Colors.WHITE} />
    </g>
  );
}
```

- [ ] **Step 3: Update `week-group.tsx` to import `CurrentTimeMarker`**

Replace the `TodayMarker` import line:
```tsx
import { CurrentTimeMarker } from "./current-time-marker";
```

Replace the JSX usage:
```tsx
{showTodayMarker && todayIndex >= 0 && <CurrentTimeMarker index={todayIndex} today={today} rowHeight={rowHeight} />}
```

- [ ] **Step 4: Verify types**

Run: `npm run ts:check`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/ui/schedule/components/month/current-time-marker.tsx \
        src/ui/schedule/components/month/week-group.tsx
git commit -m "refactor(month): rename TodayMarker to CurrentTimeMarker"
```

---

### Task 4: Extract singular `DayColumn` in week

**Files:**
- Create: `src/ui/schedule/components/week/day-column.tsx`
- Modify: `src/ui/schedule/components/week/week-schedule.tsx`
- Delete: `src/ui/schedule/components/week/day-columns.tsx`

- [ ] **Step 1: Create `week/day-column.tsx`**

```tsx
import { Colors } from "../../../../common/colors";
import { formatWeekday } from "../../../layout";
import { WEEK } from "./constants";

interface DayColumnProps {
  day: Date;
  dayIndex: number;
  isToday: boolean;
  gridTop: number;
  headerTop: number;
  totalHeight: number;
}

export function DayColumn({ day, dayIndex, isToday, gridTop, headerTop, totalHeight }: DayColumnProps) {
  const colX = WEEK.SIDEBAR_WIDTH + dayIndex * WEEK.DAY_WIDTH;
  const centerX = colX + WEEK.DAY_WIDTH / 2;
  return (
    <g>
      <line x1={colX} y1={gridTop} x2={colX} y2={totalHeight} stroke={Colors.GRID} strokeWidth={1} />
      {isToday && (
        <rect
          x={colX}
          y={headerTop}
          width={WEEK.DAY_WIDTH}
          height={WEEK.HEADER_HEIGHT}
          rx={6}
          fill={Colors.DEEP_DARK}
          fillOpacity={0.5}
        />
      )}
      <text x={centerX} y={headerTop + 27} textAnchor="middle" fontFamily={WEEK.FONT} fill={Colors.WHITE}>
        <tspan fontSize={13} fontWeight={600} fillOpacity={isToday ? 1 : 0.65}>
          {`${formatWeekday(day)} `}
        </tspan>
        <tspan fontSize={16} fontWeight={600} fillOpacity={isToday ? 1 : 0.75}>
          {`${day.getDate()}/${day.getMonth() + 1}`}
        </tspan>
      </text>
    </g>
  );
}
```

- [ ] **Step 2: Update `week-schedule.tsx`**

Replace `import { DayColumns } from "./day-columns"` with `import { DayColumn } from "./day-column"`.

Replace the `<DayColumns ... />` usage with a map. Full updated file:

```tsx
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getCurrentWeekDays, isSameDay } from "../../../../common/dates";
import { buildColorMap } from "../../../../common/colors";
import { formatUserName, OnCallEvent } from "../../../../domain/on-call-event";
import { ON_CALL_PILL_CIRC_R, OnCallPill } from "../on-call-pill";
import { WEEK } from "./constants";
import { HourGridLines } from "./hour-grid-lines";
import { HourLabels } from "./hour-labels";
import { DayColumn } from "./day-column";
import { WeekEvents } from "./week-events";
import { CurrentTimeMarker } from "./current-time-marker";

interface WeekViewProps {
  events: OnCallEvent[];
  today: Date;
  anchorDate?: Date;
  backgroundColor?: string;
  allEvents?: OnCallEvent[];
  onCallName?: string;
  onCallColor?: string;
}

function WeekViewSvg({ events, today, anchorDate, backgroundColor, allEvents, onCallName, onCallColor }: WeekViewProps) {
  const weekAnchor = anchorDate ?? today;
  const days = getCurrentWeekDays(weekAnchor);
  const colorSourceEvents = allEvents ?? events;
  const uniqueNames = [...new Set(colorSourceEvents.map((e) => formatUserName(e.user)))].sort();
  const colorMap = buildColorMap(uniqueNames);
  const todayIndex = days.findIndex((d) => isSameDay(d, today));

  const bannerHeight = onCallName && onCallColor ? ON_CALL_PILL_CIRC_R * 2 : 0;
  const headerTop = bannerHeight;
  const gridTop = bannerHeight + WEEK.HEADER_HEIGHT;
  const totalHeight = WEEK.TOTAL_HEIGHT + bannerHeight;

  const todayStartMs = todayIndex >= 0 ? new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() : 0;
  const nowFraction = todayIndex >= 0 ? (today.getTime() - todayStartMs) / (24 * 3600 * 1000) : 0;
  const markerY = gridTop + nowFraction * WEEK.TIMELINE_HEIGHT;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={WEEK.WIDTH}
      height={totalHeight}
      viewBox={`0 0 ${WEEK.WIDTH} ${totalHeight}`}
    >
      <rect width={WEEK.WIDTH} height={totalHeight} fill={backgroundColor ?? "transparent"} />
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
      <WeekEvents days={days} events={events} colorMap={colorMap} gridTop={gridTop} />
      {todayIndex >= 0 && <CurrentTimeMarker todayIndex={todayIndex} markerY={markerY} />}
      {onCallName && onCallColor && <OnCallPill cy={Math.round(bannerHeight / 2)} name={onCallName} color={onCallColor} />}
    </svg>
  );
}

export function buildWeekViewSvg(props: WeekViewProps): string {
  return renderToStaticMarkup(<WeekViewSvg {...props} />);
}
```

- [ ] **Step 3: Delete `day-columns.tsx`**

```bash
git rm src/ui/schedule/components/week/day-columns.tsx
```

- [ ] **Step 4: Verify types**

Run: `npm run ts:check`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/ui/schedule/components/week/day-column.tsx \
        src/ui/schedule/components/week/week-schedule.tsx
git commit -m "refactor(week): extract singular DayColumn, loop in week-schedule"
```

---

### Task 5: Extract singular `EventSegment` in week

**Files:**
- Create: `src/ui/schedule/components/week/event-segment.tsx`
- Modify: `src/ui/schedule/components/week/week-events.tsx`

- [ ] **Step 1: Create `week/event-segment.tsx`**

`DaySegment` moves here from `week-events.tsx`:

```tsx
import { getTextColor } from "../../../../common/colors";
import { truncateLabel } from "../../../layout";
import { WEEK } from "./constants";

export interface DaySegment {
  startFraction: number;
  endFraction: number;
  label: string;
  color: string;
}

interface EventSegmentProps {
  segment: DaySegment;
  colX: number;
  colWidth: number;
  gridTop: number;
}

export function EventSegment({ segment, colX, colWidth, gridTop }: EventSegmentProps) {
  const y = gridTop + segment.startFraction * WEEK.TIMELINE_HEIGHT;
  const height = Math.max(WEEK.MIN_EVENT_HEIGHT, (segment.endFraction - segment.startFraction) * WEEK.TIMELINE_HEIGHT);
  const textColor = getTextColor(segment.color);
  const showName = height >= WEEK.LABEL_MIN_HEIGHT;

  return (
    <g>
      <rect x={colX} y={y} width={colWidth} height={height} fill={segment.color} rx={3} />
      {showName && (
        <text x={colX + 12} y={y + 20} fontSize={16} fontWeight={600} fill={textColor} fontFamily={WEEK.FONT}>
          {truncateLabel(segment.label, colWidth - 22, 16)}
        </text>
      )}
    </g>
  );
}
```

- [ ] **Step 2: Update `week-events.tsx`**

Remove the `DaySegment` interface (now in `event-segment.tsx`), import `EventSegment` and `DaySegment`, replace the inline `<Fragment>` rendering with `<EventSegment>`:

```tsx
import { RotaColors } from "../../../../common/colors";
import { formatUserName, OnCallEvent } from "../../../../domain/on-call-event";
import { WEEK } from "./constants";
import { EventSegment, type DaySegment } from "./event-segment";

export type { DaySegment } from "./event-segment";

export function getDaySegments(events: OnCallEvent[], dayStart: Date, colorMap: Map<string, string>): DaySegment[] {
  const DAY_MS = 24 * 3600 * 1000;
  const dayStartMs = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate()).getTime();
  const dayEndMs = dayStartMs + DAY_MS;

  return events.flatMap((event) => {
    const eventStart = new Date(event.started_at).getTime();
    const eventEnd = new Date(event.ended_at).getTime();
    const segStart = Math.max(eventStart, dayStartMs);
    const segEnd = Math.min(eventEnd, dayEndMs);
    if (segEnd <= segStart) return [];
    const name = formatUserName(event.user);
    return [
      {
        startFraction: (segStart - dayStartMs) / DAY_MS,
        endFraction: (segEnd - dayStartMs) / DAY_MS,
        label: name,
        color: colorMap.get(name) ?? RotaColors.GREEN,
      },
    ];
  });
}

interface WeekEventsProps {
  days: Date[];
  events: OnCallEvent[];
  colorMap: Map<string, string>;
  gridTop: number;
}

export function WeekEvents({ days, events, colorMap, gridTop }: WeekEventsProps) {
  return (
    <>
      {days.map((day, dayIndex) => {
        const segments = getDaySegments(events, day, colorMap);
        const colX = WEEK.SIDEBAR_WIDTH + dayIndex * WEEK.DAY_WIDTH + 2;
        const colWidth = WEEK.DAY_WIDTH - 4;
        return segments.map((segment, segmentIndex) => (
          <EventSegment
            key={`ev${dayIndex}-${segmentIndex}`}
            segment={segment}
            colX={colX}
            colWidth={colWidth}
            gridTop={gridTop}
          />
        ));
      })}
    </>
  );
}
```

- [ ] **Step 3: Verify types**

Run: `npm run ts:check`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/ui/schedule/components/week/event-segment.tsx \
        src/ui/schedule/components/week/week-events.tsx
git commit -m "refactor(week): extract singular EventSegment, loop in WeekEvents"
```
