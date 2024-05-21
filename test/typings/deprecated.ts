import { assert, object, deprecated, any } from '../../src/index.js';
import { test } from '../index.test.js';

test<unknown>((value) => {
  const log = () => {
    /* noop */
  };

  assert(value, deprecated(any(), log));
  return value;
});

test<{ a?: unknown }>((value) => {
  const log = () => {
    /* noop */
  };

  assert(value, object({ a: deprecated(any(), log) }));
  return value;
});
