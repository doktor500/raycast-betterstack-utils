export const toList = <T>(list: T[] | undefined) => list ?? [];

export const rangeOf = (length: number) => Array.from({ length }, (_, index) => index);
