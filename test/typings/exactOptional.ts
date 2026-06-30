import {
  assert,
  exactOptional,
  string,
  number,
  object,
  type,
  enums,
  never,
  record,
} from '../../src';
import { test } from '../index.test';

test<string | undefined>((value) => {
  assert(value, exactOptional(string()));
  return value;
});

test<{
  a?: number;
  b: string;
  c?: 'a' | 'b';
  d?: {
    e: string;
  };
  f?: {
    g?: {
      h: string;
    };
  };
}>((value) => {
  assert(
    value,
    object({
      a: exactOptional(number()),
      b: string(),
      c: exactOptional(enums(['a', 'b'])),
      d: exactOptional(
        object({
          e: string(),
        }),
      ),
      f: exactOptional(
        object({
          g: exactOptional(object({ h: string() })),
        }),
      ),
    }),
  );
  return value;
});

test<{
  a?: Record<string, never>;
}>((value) => {
  assert(
    value,
    object({
      a: exactOptional(record(string(), never())),
    }),
  );
  return value;
});

test<{
  a?: number;
  b: string;
}>((value) => {
  assert(
    value,
    type({
      a: exactOptional(number()),
      b: string(),
    }),
  );
  return value;
});
