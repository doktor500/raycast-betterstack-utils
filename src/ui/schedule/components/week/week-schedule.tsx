import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
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

interface WeekViewProps {
  events: OnCallEvent[];
  window: TimeWindow;
  onCallUser?: OnCallUser;
}

function WeekViewSvg({ events, window, onCallUser }: WeekViewProps) {
  const today = new Date();
  const days = getCurrentWeekDays(window.start);
  const todayIndex = days.findIndex((day) => isSameDay(day, today));

  const bannerHeight = onCallUser ? ON_CALL_PILL_CIRC_R * 2 : 0;
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
      <rect width={WEEK.WIDTH} height={totalHeight} fill={onCallUser ? "transparent" : Colors.DARK} />
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
      {onCallUser && <OnCallPill cy={Math.round(bannerHeight / 2)} name={onCallUser.name} color={onCallUser.color} />}
    </svg>
  );
}

export function buildWeekViewSvg(props: WeekViewProps): string {
  return renderToStaticMarkup(<WeekViewSvg {...props} />);
}
