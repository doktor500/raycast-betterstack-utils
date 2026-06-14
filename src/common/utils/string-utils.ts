export const toString = (value: unknown | undefined) => (value ? String(value) : "");

export const capitalize = (value: string | undefined) => {
  if (value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
};
