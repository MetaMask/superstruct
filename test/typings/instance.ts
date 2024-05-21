import { assert, instance } from '../../src/index.js';
import { test } from '../index.test.js';

test<Date>((value) => {
  assert(value, instance(Date));
  return value;
});
