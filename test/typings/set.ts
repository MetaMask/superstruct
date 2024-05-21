import { assert, set, string } from '../../src/index.js';
import { test } from '../index.test.js';

test<Set<string>>((value) => {
  assert(value, set(string()));
  return value;
});
