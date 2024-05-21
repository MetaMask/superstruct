import { number, size } from '../../../src/index.js';

export const Struct = size(number(), 1, 5);

export const data = 0;

export const failures = [
  {
    value: 0,
    type: 'number',
    refinement: 'size',
    path: [],
    branch: [data],
  },
];
