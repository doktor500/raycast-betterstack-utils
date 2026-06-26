import { type CalendarMonth } from "@/common/utils/date-utils";
import { Optional } from "@/common/utils/optional-utils";

interface GridProps {
  days: Date[];
  currentCalendarMonth: CalendarMonth;
}

type DayColumnProps = {
  day: Date;
  previousDay: Optional<Date>;
  isLastColumn: boolean;
  currentCalendarMonth: CalendarMonth;
};

export function Grid({ days, currentCalendarMonth }: GridProps) {
  return (
    <div tw="flex absolute inset-0">
      <VerticalLines days={days} currentCalendarMonth={currentCalendarMonth} />
      <HorizontalBorder days={days} currentCalendarMonth={currentCalendarMonth} position="top" />
      <HorizontalBorder days={days} currentCalendarMonth={currentCalendarMonth} position="bottom" />
    </div>
  );
}

function VerticalLines({ days, currentCalendarMonth }: { days: Date[]; currentCalendarMonth: CalendarMonth }) {
  return (
    <div tw="flex absolute inset-0">
      {days.map((day, index) => (
        <DayColumn
          key={index}
          day={day}
          previousDay={index > 0 ? days[index - 1] : undefined}
          isLastColumn={index === days.length - 1}
          currentCalendarMonth={currentCalendarMonth}
        />
      ))}
    </div>
  );
}

function DayColumn({ day, previousDay, isLastColumn, currentCalendarMonth }: DayColumnProps) {
  const inMonth = isDate(day).inCalendarMonth(currentCalendarMonth);
  const prevInMonth = previousDay && isDate(previousDay).inCalendarMonth(currentCalendarMonth);
  const drawLeftBorder = inMonth || prevInMonth;

  return (
    <div tw="flex flex-1 relative h-full">
      {drawLeftBorder && <div tw="flex absolute top-0 bottom-0 left-0 w-px bg-dim" style={{ opacity: 0.3 }} />}
      {inMonth && isLastColumn && <div tw="flex absolute top-0 bottom-0 right-0 w-px bg-dim" style={{ opacity: 0.3 }} />}
    </div>
  );
}

function HorizontalBorder(props: { days: Date[]; currentCalendarMonth: CalendarMonth; position: "top" | "bottom" }) {
  const { days, currentCalendarMonth, position } = props;

  return (
    <div tw={`flex absolute ${position}-0 left-0 right-0`}>
      {days.map((day, index) => (
        <div
          key={index}
          tw={isDate(day).inCalendarMonth(currentCalendarMonth) ? "flex flex-1 h-px bg-dim" : "flex flex-1 h-px"}
          style={{ opacity: 0.3 }}
        />
      ))}
    </div>
  );
}

const isDate = (date: Date) => {
  return {
    inCalendarMonth: (calendarMonth: CalendarMonth) => {
      return date.getFullYear() === calendarMonth.year && date.getMonth() === calendarMonth.month;
    },
  };
};
