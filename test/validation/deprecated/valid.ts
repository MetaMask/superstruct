import { deprecated, number } from '../../../src/index.js';

export const Struct = deprecated(number(), () => {
  /* noop */
});

export const data = 42;

export const output = 42;
