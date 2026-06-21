import { DateTime } from "luxon";
import { rangeOf } from "@/common/utils/collection-utils";

export type TimeWindow = { start: Date; end: Date };

export function startOfWeek(date: Date): Date {
  const dateTime = DateTime.fromJSDate(date);

  return dateTime
    .minus({ days: dateTime.weekday - 1 })
    .startOf("day")
    .toJSDate();
}

export function addDays(date: Date, days: number): Date {
  return DateTime.fromJSDate(date).plus({ days }).toJSDate();
}

export function isSameDay(a: Date, b: Date): boolean {
  return DateTime.fromJSDate(a).hasSame(DateTime.fromJSDate(b), "day");
}

export function getCurrentMonthWindow(monthOffset = 0): TimeWindow {
  const now = DateTime.now().plus({ months: monthOffset });

  return {
    start: now.startOf("month").toJSDate(),
    end: now.endOf("month").toJSDate(),
  };
}

export function getCurrentWeekWindow(weekOffset = 0): TimeWindow {
  const now = DateTime.now().plus({ weeks: weekOffset });
  const monday = now.minus({ days: now.weekday - 1 }).startOf("day");

  return {
    start: monday.toJSDate(),
    end: monday.plus({ days: 6 }).endOf("day").toJSDate(),
  };
}

export function getCurrentWeekDays(date?: Date): Date[] {
  const dateTime = date ? DateTime.fromJSDate(date) : DateTime.now();
  const monday = dateTime.minus({ days: dateTime.weekday - 1 }).startOf("day");

  return rangeOf(7).map((dayIndex) => monday.plus({ days: dayIndex }).toJSDate());
}

export function isDateInInterval(date: Date, start: Date, end: Date): boolean {
  const dateTime = DateTime.fromJSDate(date);

  return dateTime >= DateTime.fromJSDate(start) && dateTime < DateTime.fromJSDate(end);
}

export function formatWeekday(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}
