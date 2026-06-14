import { isDateInInterval } from "@/common/utils/date-utils";
import { User } from "@/domain/user";
import { mergeIntervals, subtractIntervals } from "@/domain/time-interval";

export interface OnCallEvent {
  user: User;
  startedAt: string;
  endedAt: string;
  override: boolean;
}

export function getCurrentOnCallUser(date: Date, events: OnCallEvent[]): User | undefined {
  const active = events.filter((event) => isDateInInterval(date, new Date(event.startedAt), new Date(event.endedAt)));
  const override = active.find((event) => event.override);
  if (override) return override.user;

  return active[0]?.user;
}

export function resolveOverrideConflicts(events: OnCallEvent[]): OnCallEvent[] {
  const overrideEvents = events.filter((event) => event.override);
  const regularEvents = events.filter((event) => !event.override);
  if (overrideEvents.length === 0) return events;

  const overrideIntervals = mergeIntervals(
    overrideEvents.map((event) => ({
      start: new Date(event.startedAt).getTime(),
      end: new Date(event.endedAt).getTime(),
    })),
  );

  const regularEventFragments = regularEvents.flatMap((event) => {
    const interval = { start: new Date(event.startedAt).getTime(), end: new Date(event.endedAt).getTime() };
    return subtractIntervals(interval, overrideIntervals).map((fragment) => ({
      ...event,
      startedAt: new Date(fragment.start).toISOString(),
      endedAt: new Date(fragment.end).toISOString(),
    }));
  });

  return [...overrideEvents, ...regularEventFragments];
}
