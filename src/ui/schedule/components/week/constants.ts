import { FONT_FAMILY } from "../../../../common/fonts";

export const WEEK = {
  WIDTH: 1160,
  SIDEBAR_WIDTH: 25,
  HEADER_HEIGHT: 44,
  HOURS: 24,
  HOUR_HEIGHT: 20,
  TIMELINE_HEIGHT: 24 * 20,
  TOTAL_HEIGHT: 44 + 24 * 20,
  DAY_WIDTH: (1160 - 25) / 7,
  MIN_EVENT_HEIGHT: 12,
  LABEL_MIN_HEIGHT: 24,
  FONT: FONT_FAMILY,
} as const;
