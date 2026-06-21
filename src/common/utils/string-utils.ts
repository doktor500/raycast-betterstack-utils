export const toString = (value: unknown | undefined) => (value ? String(value) : "");

export const capitalize = (value: string | undefined) => {
  if (value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
};

export function truncateLabel(label: string, availableWidth: number, fontSize: number): string {
  const charWidth = fontSize * 0.58;
  const maxChars = Math.floor(availableWidth / charWidth);
  if (label.length <= maxChars) return label;

  return label.slice(0, Math.max(maxChars - 1, 1)) + "…";
}
