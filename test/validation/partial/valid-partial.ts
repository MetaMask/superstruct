import { partial, string, number } from '../../../src/index.js';

export const Struct = partial({
  name: string(),
  age: number(),
});

export const data = {
  name: 'john',
};

export const output = {
  name: 'john',
};
