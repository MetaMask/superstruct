import { object, sensitive, string } from '../../../src';

// Validates that `sensitive()` can wrap an entire `object()` struct.
// When the outer value fails (not an object at all), the failure is redacted.
export const Struct = sensitive(object({ key: string() }));

export const data = 'not-an-object';

export const failures = [
  {
    value: '***',
    type: 'object',
    refinement: undefined,
    path: [],
    branch: ['***'],
  },
];
