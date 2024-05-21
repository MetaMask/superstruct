import { assert, define } from '../../src/index.js';
import { test } from '../index.test.js';

test<string>((value) => {
  assert(
    value,
    define<string>('custom', () => true),
  );
  return value;
});
