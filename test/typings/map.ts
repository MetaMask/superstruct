import { assert, map, string, number } from '../../src/index.js';
import { test } from '../index.test.js';

test<Map<string, number>>((value) => {
  assert(value, map(string(), number()));
  return value;
});
