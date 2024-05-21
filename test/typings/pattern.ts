import { assert, pattern, string } from '../../src/index.js';
import { test } from '../index.test.js';

test<string>((value) => {
  assert(value, pattern(string(), /.*/u));
  return value;
});
