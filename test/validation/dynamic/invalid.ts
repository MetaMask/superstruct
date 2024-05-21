import { dynamic, string } from '../../../src/index.js';

export const Struct = dynamic(() => string());

export const data = 3;

export const failures = [
  {
    value: 3,
    type: 'string',
    refinement: undefined,
    path: [],
    branch: [data],
  },
];
