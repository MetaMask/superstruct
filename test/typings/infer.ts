import type { Infer } from '../../src/index.js';
import { object, assert } from '../../src/index.js';
import { test } from '../index.test.js';

const Struct = object();
type T = Infer<typeof Struct>;

test<T>((value) => {
  assert(value, Struct);
  return value;
});
