import { assert, pick, object, number, string } from '../../src/index.js';
import { test } from '../index.test.js';

test<{
  b: string;
}>((value) => {
  assert(value, pick(object({ a: number(), b: string() }), ['b']));
  return value;
});
