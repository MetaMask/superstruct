import { assert, object, sensitive, string } from '../../src';
import { test } from '../index.test';

test<string>((value) => {
  assert(value, sensitive(string()));
  return value;
});

test<{ key: string }>((value) => {
  assert(value, object({ key: sensitive(string()) }));
  return value;
});
