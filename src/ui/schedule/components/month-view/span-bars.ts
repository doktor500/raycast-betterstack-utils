import { OnCallEvent } from "@/domain/on-call-event";
import { type CalendarMonth } from "@/common/utils/date-utils";
import { getColor } from "@/common/colors";
import { formatUserName } from "@/domain/user";

const DAY_MS = 24 * 3600 * 1000;

export interface WeekSpanBar {
  startDayIndex: number;
  endDayIndex: number;
  startFraction: number;
  endFraction: number;
  label: string;
  color: string;
  lane: number;
}

interface DayPosition {
  dayIndex: number;
  fraction: number;
}

export function buildWeekSpanBars(
  days: Date[],
  events: OnCallEvent[],
  currentCalendarMonth: CalendarMonth,
): WeekSpanBar[] {
  const dayStarts = toDayStarts(days);
  const range = inMonthRange(days, currentCalendarMonth.year, currentCalendarMonth.month);
  if (!range) return [];

  const { first, last } = range;
  const windowStart = dayStarts[first];
  const windowEnd = dayStarts[last] + DAY_MS;

  const bars = events
    .map((event) => {
      const eventStart = new Date(event.startedAt).getTime();
      const eventEnd = new Date(event.endedAt).getTime();
      const overlap = clampToWindow(eventStart, eventEnd, windowStart, windowEnd);

      return overlap ? eventToLanedBar(event, overlap, dayStarts, first, last) : undefined;
    })
    .filter((bar): bar is Omit<WeekSpanBar, "lane"> => bar !== undefined)
    .toSorted((a, b) => a.startDayIndex + a.startFraction - (b.startDayIndex + b.startFraction));

  return assignSpanLanes(bars);
}

function toDayStarts(days: Date[]): number[] {
  return days.map((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime());
}

function inMonthRange(days: Date[], year: number, month: number): { first: number; last: number } | null {
  const indices = days
    .map((date, index) => ({ date, index }))
    .filter(({ date }) => date.getFullYear() === year && date.getMonth() === month)
    .map(({ index }) => index);

  if (indices.length === 0) return null;

  return { first: indices[0], last: indices[indices.length - 1] };
}

function clampToWindow(
  eventStart: number,
  eventEnd: number,
  windowStart: number,
  windowEnd: number,
): { start: number; end: number } | null {
  const start = Math.max(eventStart, windowStart);
  const end = Math.min(eventEnd, windowEnd);

  return end > start ? { start, end } : null;
}

function dayFraction(timestamp: number, dayStart: number): number {
  return (timestamp - dayStart) / DAY_MS;
}

function findStartPosition(timestamp: number, dayStarts: number[], from: number, to: number): DayPosition {
  const days = dayStarts.slice(from, to + 1);
  const match = days.findIndex((start) => timestamp >= start && timestamp < start + DAY_MS);
  const dayIndex = from + match;
  if (match === -1) return { dayIndex: from, fraction: 0 };

  return { dayIndex, fraction: dayFraction(timestamp, dayStarts[dayIndex]) };
}

function findEndPosition(timestamp: number, dayStarts: number[], from: number, to: number): DayPosition {
  const days = dayStarts.slice(from, to + 1);
  const match = days.findIndex((start) => timestamp > start && timestamp <= start + DAY_MS);
  const dayIndex = from + match;
  if (match === -1) return { dayIndex: to, fraction: 1.0 };

  return { dayIndex, fraction: dayFraction(timestamp, dayStarts[dayIndex]) };
}

function eventToLanedBar(
  event: OnCallEvent,
  overlap: { start: number; end: number },
  dayStarts: number[],
  first: number,
  last: number,
): Omit<WeekSpanBar, "lane"> {
  const label = formatUserName(event.user);
  const color = getColor(label);
  const { dayIndex: startDayIndex, fraction: startFraction } = findStartPosition(overlap.start, dayStarts, first, last);
  const { dayIndex: endDayIndex, fraction: endFraction } = findEndPosition(overlap.end, dayStarts, first, last);

  return { startDayIndex, startFraction, endDayIndex, endFraction, label, color };
}

function assignSpanLanes(bars: Omit<WeekSpanBar, "lane">[]): WeekSpanBar[] {
  const laneEnds: number[] = [];
  return bars.map((bar) => {
    const absStart = bar.startDayIndex + bar.startFraction;
    const absEnd = bar.endDayIndex + bar.endFraction;
    const laneFound = laneEnds.findIndex((end) => end <= absStart);
    const lane = laneFound === -1 ? laneEnds.length : laneFound;
    laneEnds[lane] = absEnd;

    return { ...bar, lane };
  });
}
