import React from "react";
import { fractionOfDayElapsed, getCurrentWeekDays, isSameDay, TimeWindow } from "@/common/utils/date-utils";
import { OnCallEvent } from "@/domain/on-call-event";
import { OnCallUser } from "@/domain/user";
import { cn } from "@/lib/utils";
import { OnCallUserPill } from "@/ui/schedule/components/on-call-user-pill";
import { DayColumn } from "@/ui/schedule/components/week-view/day-column";
import { HourLabels } from "@/ui/schedule/components/week-view/hour-labels";
import { renderToSvg } from "@/ui/svg-renderer";

interface WeekViewProps {
  events: OnCallEvent[];
  timeWindow: TimeWindow;
  onCallUser?: OnCallUser;
}

export async function buildWeekViewSvg(props: WeekViewProps): Promise<string> {
  return renderToSvg(<WeekScheduleView {...props} />);
}

function WeekScheduleView({ events, timeWindow, onCallUser }: WeekViewProps) {
  const today = new Date();
  const days = getCurrentWeekDays(timeWindow.start);
  const todayIndex = days.findIndex((day) => isSameDay(day, today));

  return (
    <div tw={cn("flex flex-col w-[1160px]", { "bg-dark": !onCallUser })}>
      {onCallUser && <OnCallUserPill name={onCallUser.name} color={onCallUser.color} />}
      <div tw="flex h-[500px] pt-6">
        <HourLabels />
        {days.map((day, dayIndex) => (
          <DayColumn
            key={`day-${dayIndex}`}
            events={events}
            day={day}
            dayIndex={dayIndex}
            isToday={dayIndex === todayIndex}
            markerTime={dayIndex === todayIndex ? fractionOfDayElapsed(today) : undefined}
          />
        ))}
      </div>
    </div>
  );
}