import { deprecated, string } from '../../../src/index.js';

export const Struct = deprecated(string(), () => {
  /* noop */
});

export const data = null;

export const failures = [
  {
    value: null,
    type: 'string',
    refinement: undefined,
    path: [],
    branch: [data],
  },
];
