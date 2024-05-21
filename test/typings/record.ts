import { assert, record, string, number } from '../../src/index.js';
import { test } from '../index.test.js';

test<Record<string, number>>((value) => {
  assert(value, record(string(), number()));
  return value;
});
