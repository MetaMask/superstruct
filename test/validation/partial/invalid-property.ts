import { partial, string, number } from '../../../src';

export const Struct = partial({
  name: string(),
  age: number(),
});

export const data = {
  age: 'invalid',
};

export const failures = [
  {
    value: 'invalid',
    type: 'number',
    refinement: undefined,
    path: ['age'],
    branch: [data, data.age],
  },
];
