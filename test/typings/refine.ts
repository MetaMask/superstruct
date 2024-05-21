import { assert, refine, string } from '../../src/index.js';
import { test } from '../index.test.js';

test<string>((value) => {
  assert(
    value,
    refine(string(), 'word', () => true),
  );
  return value;
});
