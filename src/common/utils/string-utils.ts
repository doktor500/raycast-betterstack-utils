export const toString = (value: unknown | undefined) => (value ? String(value) : "");
export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
