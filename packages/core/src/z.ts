export type Schema<T> = { parse: (value: unknown) => T };

export const string = (): Schema<string> => ({
  parse: (value) => {
    if (typeof value !== 'string') {
      throw new Error('Expected string');
    }
    return value;
  },
});

export const number = (): Schema<number> => ({
  parse: (value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new Error('Expected number');
    }
    return parsed;
  },
});
