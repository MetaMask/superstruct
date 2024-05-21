import { assert, date } from '../../src/index.js';
import { test } from '../index.test.js';

test<Date>((value) => {
  assert(value, date());
  return value;
});
