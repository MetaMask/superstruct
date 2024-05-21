import { assert, func } from '../../src/index.js';
import { test } from '../index.test.js';

// eslint-disable-next-line @typescript-eslint/ban-types
test<Function>((value) => {
  assert(value, func());
  return value;
});
