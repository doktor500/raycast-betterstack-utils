import React from "react";
import { getCurrentWeekDays, isSameDay, TimeWindow } from "@/common/utils/date-utils";
import { OnCallEvent } from "@/domain/on-call-event";
import { OnCallUser } from "@/domain/user";
import { OnCallPill } from "@/ui/schedule/components/on-call-pill";
import { DayColumn } from "@/ui/schedule/components/week/day-column";
import { HourLabels } from "@/ui/schedule/components/week/hour-labels";
import { Colors } from "@/common/colors";
import { renderToSvg } from "@/components/satori-renderer";

interface WeekViewProps {
  events: OnCallEvent[];
  window: TimeWindow;
  onCallUser?: OnCallUser;
}

function WeekViewRoot({ events, window, onCallUser }: WeekViewProps) {
  const today = new Date();
  const days = getCurrentWeekDays(window.start);
  const todayIndex = days.findIndex((day) => isSameDay(day, today));

  const bannerHeight = onCallUser ? 32 : 0;
  const totalHeight = bannerHeight + 524; // 44px header + 480px timeline

  const todayStartMs = todayIndex >= 0 ? new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() : 0;
  const nowFraction = todayIndex >= 0 ? (today.getTime() - todayStartMs) / (24 * 3600 * 1000) : 0;

  const bgColor = onCallUser ? "transparent" : Colors.DARK;

  return (
    <div tw={`flex flex-col w-[1160px] h-[${totalHeight}px] bg-[${bgColor}]`}>
      {onCallUser && <OnCallPill name={onCallUser.name} color={onCallUser.color} />}
      <div tw="flex h-[524px]">
        <HourLabels />
        {days.map((day, dayIndex) => (
          <DayColumn
            key={dayIndex}
            day={day}
            dayIndex={dayIndex}
            isToday={isSameDay(day, today)}
            events={events}
            nowFraction={dayIndex === todayIndex ? nowFraction : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export async function buildWeekViewSvg(props: WeekViewProps): Promise<string> {
  return renderToSvg(<WeekViewRoot {...props} />, 1160);
}
