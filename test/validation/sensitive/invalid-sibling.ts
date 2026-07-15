import { literal, object, sensitive, string } from '../../../src';

export const Struct = object({
  secret: sensitive(string()),
  tag: literal('ok'),
});

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
