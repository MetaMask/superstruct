import { assert, regexp } from '../../src/index.js';
import { test } from '../index.test.js';

test<RegExp>((value) => {
  assert(value, regexp());
  return value;
});
