import { number, optional } from '../../../src/index.js';

export const Struct = optional(number());

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
