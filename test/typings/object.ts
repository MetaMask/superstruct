import { assert, object, number, string, record, never } from '../../src';
import { test } from '../index.test';

test<Record<string, unknown>>((value) => {
  assert(value, object());
  return value;
});

test<{
  a: number;
  b: string;
}>((value) => {
  assert(value, object({ a: number(), b: string() }));
  return value;
});

test<{
  a: Record<string, never>;
}>((value) => {
  assert(
    value,
    object({
      a: record(string(), never()),
    }),
  );
  return value;
});
