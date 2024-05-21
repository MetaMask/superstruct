import { assert, any } from '../../src/index.js';
import { test } from '../index.test.js';

test<any>((value) => {
  assert(value, any());
  return value;
});
