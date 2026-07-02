import { sensitive, string } from '../../../src';

export const Struct = sensitive(string());
export const data = 123;
export const failures = [
  {
    value: '***',
    type: 'string',
    refinement: undefined,
    path: [],
    branch: ['***'],
  },
];
