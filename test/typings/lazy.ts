import { assert, lazy, string } from '../../src/index.js';
import { test } from '../index.test.js';

test<string>((value) => {
  assert(
    value,
    lazy(() => string()),
  );
  return value;
});
