import { assert, number, min } from '../../src/index.js';
import { test } from '../index.test.js';

test<number>((value) => {
  assert(value, min(number(), 0));
  return value;
});
