import { literal, object, sensitive, string } from '../../../src';

// Three levels of nesting: RootStruct > WrapperStruct > AccountStruct.
// A sibling failure inside AccountStruct must redact sensitive data from
// ALL branch entries — including both intermediate and root ancestors.
const SecretStruct = object({
  secret: sensitive(string()),
  encoding: literal('hex'),
});

const WrapperStruct = object({
  account: SecretStruct,
  tag: literal('ok'),
});

export const Struct = object({
  wrapper: WrapperStruct,
  id: literal('root'),
});

export const data = {
  wrapper: {
    account: { secret: 'super-secret', encoding: 'invalid-encoding' },
    tag: 'ok',
  },
  id: 'root',
};

export const failures = [
  {
    value: 'invalid-encoding',
    type: 'literal',
    refinement: undefined,
    path: ['wrapper', 'account', 'encoding'],
    branch: [
      {
        wrapper: {
          account: { secret: '***', encoding: 'invalid-encoding' },
          tag: 'ok',
        },
        id: 'root',
      },
      {
        account: { secret: '***', encoding: 'invalid-encoding' },
        tag: 'ok',
      },
      { secret: '***', encoding: 'invalid-encoding' },
      'invalid-encoding',
    ],
  },
];
