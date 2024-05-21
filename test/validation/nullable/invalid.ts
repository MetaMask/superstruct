import { number, nullable } from '../../../src/index.js';

export const Struct = nullable(number());

export const data = 'invalid';

export const failures = [
  {
    value: 'invalid',
    type: 'number',
    refinement: undefined,
    path: [],
    branch: [data],
  },
];
