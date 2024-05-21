import { bigint } from '../../../src/index.js';

export const Struct = bigint();

export const data = 3;

export const failures = [
  {
    value: 3,
    type: 'bigint',
    refinement: undefined,
    path: [],
    branch: [data],
  },
];
