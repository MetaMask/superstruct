import { type, string, number } from '../../../src';

export const Struct = type({
  id: number(),
  person: type({
    name: string(),
    age: number(),
  }),
});

export const data = {
  id: 1,
};

export const failures = [
  {
    value: undefined,
    type: 'type',
    refinement: undefined,
    path: ['person'],
    branch: [data, undefined],
  },
];
