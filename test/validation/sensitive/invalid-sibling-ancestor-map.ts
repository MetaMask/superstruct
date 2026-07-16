import { literal, map, object, sensitive, string } from '../../../src';

// When a sensitive-entries object lives inside a Map, the Map itself appears
// as an ancestor in the branch. Object.keys() returns [] for Maps, so the
// backward walk must handle this case by iterating the Map's entries directly.
const SecretStruct = object({
  secret: sensitive(string()),
  tag: literal('ok'),
});

export const Struct = map(string(), SecretStruct);

export const data = new Map([
  ['key', { secret: 'super-secret', tag: 'INVALID' }],
]);

export const failures = [
  {
    value: 'INVALID',
    type: 'literal',
    refinement: undefined,
    path: ['key', 'tag'],
    branch: [
      new Map([['key', { secret: '***', tag: 'INVALID' }]]),
      { secret: '***', tag: 'INVALID' },
      'INVALID',
    ],
  },
];
