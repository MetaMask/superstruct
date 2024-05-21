import { assert, boolean } from '../../src/index.js';
import { test } from '../index.test.js';

test<boolean>((value) => {
  assert(value, boolean());
  return value;
});
