import { assert, never } from '../../src/index.js';
import { test } from '../index.test.js';

test<never>((value) => {
  assert(value, never());
  return value;
});
