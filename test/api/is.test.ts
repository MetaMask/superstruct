import { deepStrictEqual, strictEqual } from 'assert';
import { describe, it } from 'vitest';

import {
  array,
  deprecated,
  is,
  number,
  object,
  refine,
  string,
  Struct,
  validate,
} from '../../src';

/**
 * Create a struct that records the path and branch it is checked at.
 *
 * @param calls - The array to record into.
 * @returns A struct accepting any string.
 */
function recording(calls: unknown[]) {
  return refine(string(), 'recording', (value, ctx) => {
    calls.push({ value, path: [...ctx.path], branch: [...ctx.branch] });
    return value !== 'bad';
  });
}

describe('is', () => {
  it('valid as helper', () => {
    strictEqual(is('valid', string()), true);
  });

  it('valid as method', () => {
    strictEqual(string().is('valid'), true);
  });

  it('invalid as helper', () => {
    strictEqual(is(42, string()), false);
  });

  it('invalid as method', () => {
    strictEqual(string().is(42), false);
  });

  describe('parity with validate', () => {
    for (const [label, input] of [
      ['valid', { a: ['x', 'y'], b: 'z' }],
      ['invalid', { a: ['x', 'bad', 'y'], b: 'bad' }],
    ] as const) {
      it(`passes the same context to validators for ${label} input`, () => {
        const viaIs: unknown[] = [];
        const viaValidate: unknown[] = [];
        const make = (calls: unknown[]) =>
          object({ a: array(recording(calls)), b: recording(calls) });

        const isResult = is(input, make(viaIs));
        const validateResult = !validate(input, make(viaValidate))[0];

        strictEqual(isResult, validateResult);
        // `validate` stops at the first failure just like `is`, so the
        // recorded calls must match exactly.
        deepStrictEqual(viaIs, viaValidate.slice(0, viaIs.length));
        strictEqual(viaIs.length > 0, true);
      });

      it(`logs deprecated the same number of times for ${label} input`, () => {
        let isLogs = 0;
        let validateLogs = 0;
        const make = (log: () => void) =>
          object({
            a: deprecated(number(), log),
            b: deprecated(string(), log),
          });

        is({ a: 1, b: input.b === 'bad' ? 2 : 'ok' }, make(() => isLogs++));
        validate(
          { a: 1, b: input.b === 'bad' ? 2 : 'ok' },
          make(() => validateLogs++),
        );

        strictEqual(isLogs, validateLogs);
      });
    }

    it('handles entries with an undefined key', () => {
      const inner = string();
      const make = () =>
        new Struct<string, null>({
          type: 'wrapper',
          schema: null,
          *entries(value) {
            yield [undefined, value, inner];
          },
        });

      strictEqual(is('a', make()), true);
      strictEqual(is(1, make()), false);
      strictEqual(is(1, make()), !validate(1, make())[0]);
    });

    it('fails when only the refiner fails', () => {
      const struct = refine(string(), 'never', () => false);

      strictEqual(is('a', struct), false);
    });

    it('returns an empty iterable of failures for passing values', () => {
      const ctx = { path: [], branch: [] };

      deepStrictEqual([...string().validator('a', ctx)], []);
      deepStrictEqual([...string().refiner('a', ctx)], []);
    });
  });
});
