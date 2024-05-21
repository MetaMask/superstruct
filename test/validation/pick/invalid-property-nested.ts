import { pick, object, string } from '../../../src/index.js';

export const Struct = pick(
  object({
    name: string(),
    address: object({
      street: string(),
      city: string(),
    }),
  }),
  ['address'],
);

export const data = {
  address: {
    street: 123,
    city: 'Springfield',
  },
};

export const failures = [
  {
    value: 123,
    type: 'string',
    refinement: undefined,
    path: ['address', 'street'],
    branch: [data, data.address, data.address.street],
  },
];
