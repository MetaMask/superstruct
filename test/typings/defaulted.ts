import { assert, defaulted, string } from '../../src/index.js';
import { test } from '../index.test.js';

test<string>((value) => {
  assert(value, defaulted(string(), 'Untitled'));
  return value;
});
