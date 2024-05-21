import { assert, string } from '../../src/index.js';
import { test } from '../index.test.js';

test<string>((value) => {
  assert(value, string());
  return value;
});
