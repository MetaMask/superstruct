import { type, string, number } from '../../../src/index.js';

export const Struct = type({
  name: string(),
  age: number(),
});

export const data = 'invalid';

export const failures = [
  {
    value: 'invalid',
    type: 'type',
    refinement: undefined,
    path: [],
    branch: [data],
  },
];
