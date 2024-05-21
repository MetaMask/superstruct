import { partial, object, string, number } from '../../../src/index.js';

export const Struct = partial(
  object({
    name: string(),
    age: number(),
  }),
);

export const data = {
  name: 'john',
};

export const output = {
  name: 'john',
};
