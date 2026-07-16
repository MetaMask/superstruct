import { array, literal, object, sensitive, string } from '../../../src';

// When a sensitive-entries object lives inside an array field, the array
// itself appears as an ancestor in the branch. The backward walk must handle
// this by copying the array and replacing the sanitised element, rather than
// treating it as a plain object with property keys.
const SecretStruct = object({
  secret: sensitive(string()),
  encoding: literal('hex'),
});

export const Struct = object({
  items: array(SecretStruct),
  tag: literal('ok'),
});

export const data = {
  items: [{ secret: 'super-secret', encoding: 'invalid-encoding' }],
  tag: 'ok',
};

export const failures = [
  {
    value: 'invalid-encoding',
    type: 'literal',
    refinement: undefined,
    path: ['items', 0, 'encoding'],
    branch: [
      {
        items: [{ secret: '***', encoding: 'invalid-encoding' }],
        tag: 'ok',
      },
      [{ secret: '***', encoding: 'invalid-encoding' }],
      { secret: '***', encoding: 'invalid-encoding' },
      'invalid-encoding',
    ],
  },
];
