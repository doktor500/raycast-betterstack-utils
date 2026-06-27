import { Optional } from "@/common/utils/optional-utils";

export const toString = (value: Optional<unknown>) => (value ? String(value) : "");

export const capitalize = (value: Optional<string>) => {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
};

export function truncateLabel(label: string, availableWidth: number, fontSize: number): string {
  const charWidth = fontSize * 0.50;
  const maxChars = Math.floor(availableWidth / charWidth);
  if (label.length <= maxChars) return label;

  return label.slice(0, Math.max(maxChars - 1, 1)) + "…";
}
