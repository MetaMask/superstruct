import { partial, string, number } from '../../../src';

export const Struct = partial({
  name: string(),
  age: number(),
});

export const data = 'invalid';

export const failures = [
  {
    value: 'invalid',
    type: 'object',
    refinement: undefined,
    path: [],
    branch: [data],
  },
];
