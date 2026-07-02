import { object, sensitive, string } from '../../../src';

export const Struct = object({ key: sensitive(string()) });
export const data = { key: 123 };
export const failures = [
  {
    value: '***',
    type: 'string',
    refinement: undefined,
    path: ['key'],
    branch: ['***', '***'],
  },
];
