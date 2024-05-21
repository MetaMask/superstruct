import { assert, omit, object, number, string, type } from '../../src/index.js';
import { test } from '../index.test.js';

test<{
  b: string;
}>((value) => {
  assert(value, omit(object({ a: number(), b: string() }), ['a']));
  return value;
});

test<{
  b: string;
}>((value) => {
  assert(value, omit(type({ a: number(), b: string() }), ['a']));
  return value;
});
