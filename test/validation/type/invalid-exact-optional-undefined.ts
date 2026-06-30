import { type, exactOptional, string, number } from '../../../src';

export const Struct = type({
  name: string(),
  age: exactOptional(number()),
});

export const data = {
  name: 'john',
  age: undefined,
};

export const failures = [
  {
    value: undefined,
    type: 'number',
    refinement: undefined,
    path: ['age'],
    branch: [data, data.age],
  },
];
