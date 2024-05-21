import { assert, type, number } from '../../src/index.js';
import { test } from '../index.test.js';

test<{ a: number }>((value) => {
  assert(value, type({ a: number() }));
  return value;
});
