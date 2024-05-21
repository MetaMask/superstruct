import { assert, bigint } from '../../src/index.js';
import { test } from '../index.test.js';

test<bigint>((value) => {
  assert(value, bigint());
  return value;
});
