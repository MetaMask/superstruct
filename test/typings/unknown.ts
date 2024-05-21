import { assert, unknown } from '../../src/index.js';
import { test } from '../index.test.js';

test<unknown>((value) => {
  assert(value, unknown());
  return value;
});
