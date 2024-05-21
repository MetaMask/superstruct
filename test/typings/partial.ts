import { assert, object, number } from '../../src/index.js';
import { test } from '../index.test.js';

test<{ a?: number }>((value) => {
  assert(value, object({ a: number() }));
  return value;
});
