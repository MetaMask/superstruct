import { literal, type, sensitive, string } from '../../../src';

export const Struct = type({
  secret: sensitive(string()),
  tag: literal('ok'),
});

class Payload {
  secret = 'raw-secret';

  tag = 'bad';
}

export const data = new Payload();

export const failures = [
  {
    value: 'bad',
    type: 'literal',
    refinement: undefined,
    path: ['tag'],
    branch: [{ secret: '***', tag: 'bad' }, 'bad'],
  },
];
