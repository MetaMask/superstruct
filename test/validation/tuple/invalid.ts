import { tuple, string, number } from '../../../src';

export const Struct = tuple([string(), number()]);

export const data = 'invalid';

export const failures = [
  {
    value: 'invalid',
    type: 'tuple',
    refinement: undefined,
    path: [],
    branch: [data],
  },
];
