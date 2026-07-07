import { refine, sensitive, string } from '../../../src';

// Validates that a refiner failure preserves the refinement name in the
// message while still fully redacting `value` and `branch`.
export const Struct = sensitive(refine(string(), 'nonempty', (v) => v.length > 0));

export const data = '';

export const failures = [
  {
    value: '***',
    type: 'string',
    refinement: 'nonempty',
    path: [],
    branch: ['***'],
  },
];
