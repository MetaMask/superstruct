import { string, size } from '../../../src/index.js';

export const Struct = size(string(), 1, 5);

export const data = '';

export const failures = [
  {
    value: '',
    type: 'string',
    refinement: 'size',
    path: [],
    branch: [data],
  },
];
