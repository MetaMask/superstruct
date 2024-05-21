import { assert, number } from '../../src/index.js';
import { test } from '../index.test.js';

test<number>((value) => {
  assert(value, number());
  return value;
});
