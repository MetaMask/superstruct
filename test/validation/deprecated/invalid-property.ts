import { deprecated, number, object } from '../../../src/index.js';

export const Struct = object({
  deprecatedKey: deprecated(number(), () => {
    /* noop */
  }),
});

export const data = {
  deprecatedKey: '42',
};

export const failures = [
  {
    value: '42',
    type: 'number',
    refinement: undefined,
    path: ['deprecatedKey'],
    branch: [data, data.deprecatedKey],
  },
];
