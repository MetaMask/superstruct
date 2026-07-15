import { literal, object, sensitive, string } from '../../../src';

// When a sensitive() field lives inside a nested object(), a sibling-field
// failure must redact sensitive data from ALL branch entries — including
// ancestor objects that hold a reference to the inner (parent) object.
// Without the fix, branch[0] (the outer wrapper) still exposes secret
// via its `account` property.
const SecretStruct = object({
  secret: sensitive(string()),
  encoding: literal('hex'),
});

export const Struct = object({
  account: SecretStruct,
  tag: literal('ok'),
});

export const data = {
  account: { secret: 'super-secret', encoding: 'invalid-encoding' },
  tag: 'ok',
};

export const failures = [
  {
    value: 'invalid-encoding',
    type: 'literal',
    refinement: undefined,
    path: ['account', 'encoding'],
    branch: [
      {
        account: { secret: '***', encoding: 'invalid-encoding' },
        tag: 'ok',
      },
      { secret: '***', encoding: 'invalid-encoding' },
      'invalid-encoding',
    ],
  },
];
