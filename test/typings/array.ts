import { assert, array, number } from '../../src/index.js';
import { test } from '../index.test.js';

test<unknown[]>((value) => {
  assert(value, array());
  return value;
});

test<number[]>((value) => {
  assert(value, array(number()));
  return value;
});
