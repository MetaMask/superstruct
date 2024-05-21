import { assert, nullable, string, object, enums } from '../../src/index.js';
import { test } from '../index.test.js';

test<string | null>((value) => {
  assert(value, nullable(string()));
  return value;
});

test<{ a: string | null }>((value) => {
  assert(value, object({ a: nullable(string()) }));
  return value;
});

test<{
  a: 'a';
  b: 'b';
}>(() => {
  return nullable(enums(['a', 'b'])).schema;
});
