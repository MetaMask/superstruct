import {
  assert,
  strictOptional,
  string,
  number,
  object,
  enums,
} from '../../src';
import { test } from '../index.test';

test<string | undefined>((value) => {
  assert(value, strictOptional(string()));
  return value;
});

test<{
  a?: number;
  b: string;
  c?: 'a' | 'b';
  d?: {
    e: string;
  };
}>((value) => {
  assert(
    value,
    object({
      a: strictOptional(number()),
      b: string(),
      c: strictOptional(enums(['a', 'b'])),
      d: strictOptional(
        object({
          e: string(),
        }),
      ),
    }),
  );
  return value;
});
