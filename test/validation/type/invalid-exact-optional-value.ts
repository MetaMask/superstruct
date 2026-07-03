import { type, exactOptional, string, number } from '../../../src';

export const Struct = type({
  name: string(),
  age: exactOptional(number()),
});

export const data = {
  name: 'john',
  age: '42',
};

export const failures = [
  {
    value: '42',
    type: 'number',
    refinement: undefined,
    path: ['age'],
    branch: [data, data.age],
  },
];
