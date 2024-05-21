import { number, pick, string, type } from '../../../src/index.js';

export const Struct = pick(
  type({
    name: string(),
    age: number(),
  }),
  ['name'],
);

export const data = {
  name: 'john',
  unknownProperty: true,
};

export const output = {
  name: 'john',
  unknownProperty: true,
};
