import { assert, number, max } from '../../src/index.js';
import { test } from '../index.test.js';

test<number>((value) => {
  assert(value, max(number(), 0));
  return value;
});
