import { assert, coerce, string, number } from '../../src/index.js';
import { test } from '../index.test.js';

test<number>((value) => {
  assert(
    value,
    coerce(number(), string(), (coercionValue) => parseFloat(coercionValue)),
  );
  return value;
});
