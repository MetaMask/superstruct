import { assert, object, number, string } from '../../src/index.js';
import { test } from '../index.test.js';

test<Record<string, unknown>>((value) => {
  assert(value, object());
  return value;
});

test<{
  a: number;
  b: string;
}>((value) => {
  assert(value, object({ a: number(), b: string() }));
  return value;
});
