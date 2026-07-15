import { number, object, sensitive, string } from '../../../src';

// Validates that `sensitive()` on the outer object redacts failures at every
// depth: a top-level field (`a`), and two fields inside a nested object
// (`nested.b`, `nested.c`).
export const Struct = sensitive(
  object({
    a: string(),
    nested: object({
      b: number(),
      c: string(),
    }),
  }),
);

export const data = { a: 123, nested: { b: 'not-a-number', c: 456 } };

export const failures = [
  {
    value: '***',
    type: 'string',
    refinement: undefined,
    path: ['a'],
    branch: ['***', '***'],
  },
  {
    value: '***',
    type: 'number',
    refinement: undefined,
    path: ['nested', 'b'],
    branch: ['***', '***', '***'],
  },
  {
    value: '***',
    type: 'string',
    refinement: undefined,
    path: ['nested', 'c'],
    branch: ['***', '***', '***'],
  },
];
