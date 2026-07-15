import { literal, object, sensitive, string } from '../../../src';

// Validates that sibling-field branch redaction works when coercion is active
// (create / mask / validate with coerce). `run` builds `branch` before calling
// the struct coercer, so the parent reference in `branch` can differ from the
// coerced `value` received by `entries`. The fix reads from `context.branch`.
export const Struct = object({
  secret: sensitive(string()),
  tag: literal('ok'),
});

export const create = true;
export const data = { secret: 'raw-secret', tag: 'bad' };

export const failures = [
  {
    value: 'bad',
    type: 'literal',
    refinement: undefined,
    path: ['tag'],
    branch: [{ secret: '***', tag: 'bad' }, 'bad'],
  },
];
