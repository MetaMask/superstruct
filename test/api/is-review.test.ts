import { deepStrictEqual, notStrictEqual, strictEqual } from 'assert';
import { describe, it } from 'vitest';

import {
  array,
  deprecated,
  intersection,
  is,
  never,
  object,
  refine,
  string,
  Struct,
  validate,
} from '../../src';
import type { Context } from '../../src';

describe('is (review)', () => {
  it('records exactly the same calls as validate (no slice)', () => {
    for (const input of [
      { a: ['x', 'y'], b: 'z' },
      { a: ['x', 'bad', 'y'], b: 'bad' },
    ]) {
      const record = (calls: unknown[]) =>
        refine(string(), 'recording', (value, ctx) => {
          calls.push({ value, path: [...ctx.path], branch: [...ctx.branch] });
          return value !== 'bad';
        });
      const viaIs: unknown[] = [];
      const viaValidate: unknown[] = [];
      is(input, object({ a: array(record(viaIs)), b: record(viaIs) }));
      validate(
        input,
        object({ a: array(record(viaValidate)), b: record(viaValidate) }),
      );
      deepStrictEqual(viaIs, viaValidate);
    }
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
        k: new Struct<string, null>({
          type: 'wrapper',
          schema: null,
          *entries(value) {
            yield [
              undefined as unknown as string,
              value,
              refine(string(), 'p', (_, ctx) => Boolean(paths.push(ctx.path))),
            ];
          },
        }),
      });
    const viaIs: unknown[] = [];
    const viaValidate: unknown[] = [];

    is({ k: 'x' }, make(viaIs));
    validate({ k: 'x' }, make(viaValidate));

    deepStrictEqual(viaIs, [['k']]);
    deepStrictEqual(viaIs, viaValidate);
  });

  it('gives each struct its own context object, like validate', () => {
    const run = (check: (value: unknown, struct: Struct<any>) => unknown) => {
      const contexts: Context[] = [];
      const child = new Struct({
        type: 'child',
        schema: null,
        validator: (_value, ctx) => Boolean(contexts.push(ctx)),
      });
      const parent = new Struct({
        type: 'parent',
        schema: null,
        validator: (_value, ctx) => Boolean(contexts.push(ctx)),
        *entries(value) {
          yield [undefined as unknown as string, value, child];
        },
      });
      check('x', parent);
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
