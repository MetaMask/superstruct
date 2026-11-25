import { deepStrictEqual, notStrictEqual, strictEqual } from 'assert';
import { describe, it } from 'vitest';

import {
  array,
  deprecated,
  intersection,
  is,
  never,
  number,
  object,
  refine,
  string,
  Struct,
  validate,
} from '../../src';
import type { Context } from '../../src';

/**
 * Create a struct that records the path and branch it is checked at.
 *
 * @param calls - The array to record into.
 * @returns A struct accepting any string except `'bad'`.
 */
function recording(calls: unknown[]) {
  return refine(string(), 'recording', (value, ctx) => {
    calls.push({ value, path: [...ctx.path], branch: [...ctx.branch] });
    return value !== 'bad';
  });
}

/**
 * Create a struct that yields its own value to `child` with an undefined key.
 *
 * @param child - The struct to yield.
 * @param validator - An optional validator for the parent.
 * @returns A struct with one undefined-key entry.
 */
function withUndefinedKeyEntry(
  child: Struct<any, any>,
  validator?: (value: unknown, ctx: Context) => boolean,
) {
  return new Struct<string, null>({
    type: 'wrapper',
    schema: null,
    validator,
    *entries(value) {
      yield [undefined as unknown as string, value, child];
    },
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
    for (const [label, input, deprecatedB] of [
      ['valid', { a: ['x', 'y'], b: 'z' }, 'ok'],
      ['invalid', { a: ['x', 'bad', 'y'], b: 'bad' }, 2],
    ] as const) {
      it(`records the same validator calls and contexts for ${label} input`, () => {
        const viaIs: unknown[] = [];
        const viaValidate: unknown[] = [];
        const make = (calls: unknown[]) =>
          object({ a: array(recording(calls)), b: recording(calls) });

        strictEqual(
          is(input, make(viaIs)),
          !validate(input, make(viaValidate))[0],
        );
        // Both stop at the first failure, so the calls must match exactly.
        deepStrictEqual(viaIs, viaValidate);
        strictEqual(viaIs.length > 0, true);
      });

      it(`logs deprecated the same number of times for ${label} input`, () => {
        let isLogs = 0;
        let validateLogs = 0;
        const value = { a: 1, b: deprecatedB };
        const make = (log: () => void) =>
          object({
            a: deprecated(number(), log),
            b: deprecated(string(), log),
          });

        is(
          value,
          make(() => (isLogs += 1)),
        );
        validate(
          value,
          make(() => (validateLogs += 1)),
        );

        strictEqual(isLogs, validateLogs);
      });
    }

    it('fails when only the refiner fails', () => {
      strictEqual(
        is(
          'a',
          refine(string(), 'never', () => false),
        ),
        false,
      );
    });

    it('does not call the refiner when the validator fails', () => {
      let calls = 0;
      const struct = refine(string(), 'r', () => {
        calls += 1;
        return true;
      });

      strictEqual(is(1, struct), false);
      strictEqual(calls, 0);
    });

    it('does not call a container refiner when a child fails', () => {
      let calls = 0;
      const struct = refine(object({ a: string() }), 'r', () => {
        calls += 1;
        return true;
      });

      strictEqual(is({ a: 1 }, struct), false);
      strictEqual(calls, 0);
    });

    it('calls a container refiner after its children', () => {
      const log: string[] = [];
      const leaf = refine(string(), 'leaf', () => Boolean(log.push('leaf')));
      const struct = refine(object({ a: leaf }), 'root', () =>
        Boolean(log.push('root')),
      );

      strictEqual(is({ a: 'x' }, struct), true);
      deepStrictEqual(log, ['leaf', 'root']);
    });

    it('does not visit children when the parent validator fails', () => {
      const log: string[] = [];
      const struct = intersection([
        object({ a: deprecated(string(), () => log.push('a')) }),
        never() as unknown as Struct<any>,
      ]);

      strictEqual(is({ a: 'x' }, struct), false);
      deepStrictEqual(log, []);
    });

    it('does not extend the path for entries with an undefined key', () => {
      const make = (paths: unknown[]) =>
        object({
          k: withUndefinedKeyEntry(
            refine(string(), 'p', (_, ctx) => Boolean(paths.push(ctx.path))),
          ),
        });
      const viaIs: unknown[] = [];
      const viaValidate: unknown[] = [];

      is({ k: 'x' }, make(viaIs));
      validate({ k: 'x' }, make(viaValidate));

      deepStrictEqual(viaIs, [['k']]);
      deepStrictEqual(viaIs, viaValidate);
      strictEqual(is(1, withUndefinedKeyEntry(string())), false);
    });

    it('gives each struct its own context object, like validate', () => {
      const run = (check: (value: unknown, struct: Struct<any>) => unknown) => {
        const contexts: Context[] = [];
        const record = (_value: unknown, ctx: Context) =>
          Boolean(contexts.push(ctx));
        const child = new Struct({
          type: 'child',
          schema: null,
          validator: record,
        });
        check('x', withUndefinedKeyEntry(child, record));
        return contexts;
      };

      const viaValidate = run((value, struct) => validate(value, struct));
      const viaIs = run((value, struct) => is(value, struct));

      notStrictEqual(viaValidate[0], viaValidate[1]);
      notStrictEqual(viaIs[0], viaIs[1]);
    });

    it('keeps retained contexts intact after the check', () => {
      const run = (check: (value: unknown, struct: Struct<any>) => unknown) => {
        const contexts: Context[] = [];
        const leaf = refine(string(), 'keep', (_, ctx) =>
          Boolean(contexts.push(ctx)),
        );
        check({ a: 'x', b: ['y'] }, object({ a: leaf, b: array(leaf) }));
        return contexts.map(({ path, branch }) => ({ path, branch }));
      };

      deepStrictEqual(
        run((value, struct) => is(value, struct)),
        run((value, struct) => validate(value, struct)),
      );
    });
  });
});
