import { assert, integer } from '../../src/index.js';
import { test } from '../index.test.js';

test<number>((value) => {
  assert(value, integer());
  return value;
});
