import { assert, dynamic, string } from '../../src/index.js';
import { test } from '../index.test.js';

test<string>((value) => {
  assert(
    value,
    dynamic(() => string()),
  );
  return value;
});
