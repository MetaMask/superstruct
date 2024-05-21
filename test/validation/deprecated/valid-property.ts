import { type, number, deprecated, any } from '../../../src/index.js';

export const Struct = type({
  name: deprecated(any(), () => {
    /* noop */
  }),
  age: number(),
});

export const data = {
  age: 42,
};

export const output = {
  age: 42,
};
