import { assert, string, trimmed } from '../../src/index.js';
import { test } from '../index.test.js';

test<string>((value) => {
  assert(value, trimmed(string()));
  return value;
});
