import { assert, array, number } from '../../src';
import { test } from '../index.test';

test<unknown[]>((x) => {
  assert(x, array());
  return x;
});

test<number[]>((x) => {
  assert(x, array(number()));
  return x;
});
