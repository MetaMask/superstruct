import { object, sensitive, string } from '../../../src';

// Validates that when the outer `object()` is wrapped in `sensitive()` and a
// sub-field fails, both the failing value and the parent object in the branch
// are fully redacted.
export const Struct = sensitive(object({ key: string() }));

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
