import { number, partial, string, type } from '../../../src/index.js';

export const Struct = partial(
  type({
    name: string(),
    age: number(),
  }),
);

export const data = {
  name: 'john',
  unknownProperty: true,
};

export const output = {
  name: 'john',
  unknownProperty: true,
};
