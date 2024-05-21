import { type, string, number, optional } from '../../../src/index.js';

export const Struct = type({
  name: optional(string()),
  age: number(),
});

export const data = {
  age: 42,
};

export const output = {
  age: 42,
};
