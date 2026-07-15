import type { Failure } from '../error.js';
import type { Context } from '../struct.js';
import { Struct } from '../struct.js';
import { isObject } from '../utils.js';
import type { AnyStruct } from '../utils.js';

const SENSITIVE_REDACTED = '***';

// Global-registry Symbol so the brand is shared across multiple instances of
// this library loaded in the same runtime (e.g. npm dedup failure). Compare
// with `ExactOptionalBrand`, which uses a plain string for the same reason.
// Using Symbol.for() (not Symbol()) means isSensitiveStruct() works even when
// `sensitive()` and `object()` come from different copies of this package.
const SENSITIVE_BRAND = Symbol.for('superstruct.sensitive');

/**
 * Check whether a struct was created by `sensitive()`, or wraps one.
 *
 * @param struct - The struct to check.
 * @returns `true` if the struct carries the sensitive brand.
 */
export function isSensitiveStruct(struct: AnyStruct): boolean {
  return Object.prototype.hasOwnProperty.call(struct, SENSITIVE_BRAND);
}

/**
 * Return a shallow copy of `sourceObj` with each key in `keys` replaced by
 * the redaction placeholder.
 *
 * @param sourceObj - The source object to copy and redact.
 * @param keys - The property names to redact.
 * @returns A shallow copy with the specified keys replaced.
 */
function redactKeys(
  sourceObj: Record<PropertyKey, unknown>,
  keys: string[],
): Record<PropertyKey, unknown> {
  const redacted = { ...sourceObj };
  for (const key of keys) {
    if (key in redacted) {
      redacted[key] = SENSITIVE_REDACTED;
    }
  }
  return redacted;
}

/**
 * Wrap a struct so that every failure it (and any of its entries) emits is
 * fully redacted: `value` and every item in `branch` are replaced with
 * `SENSITIVE_REDACTED`. Field structs yielded by `entries` are wrapped
 * recursively so that nested object failures are covered too.
 *
 * This is the internal workhorse for `sensitive()`. It deliberately does NOT
 * stamp the `SENSITIVE_BRAND` so that only the user-facing wrapper is
 * detectable via `isSensitiveStruct()`.
 *
 * @param struct - The struct to wrap.
 * @returns The wrapped struct with identical validation logic but fully
 * redacted failures.
 */
function wrapWithRedaction<Type, Schema>(
  struct: Struct<Type, Schema>,
): Struct<Type, Schema> {
  // eslint-disable-next-line jsdoc/require-jsdoc
  function* redact(failures: Iterable<Failure>): Iterable<Failure> {
    for (const failure of failures) {
      yield {
        ...failure,
        value: SENSITIVE_REDACTED,
        // We cannot safely preserve `failure.message` even for refiner
        // failures: a refiner that returns `false` gets a default message from
        // `toFailure` that embeds the raw value. There is no field on `Failure`
        // that distinguishes a custom refiner string from that generated
        // default, so preserving the original message risks leaking the
        // sensitive value. We rebuild the template from scratch, mirroring
        // `toFailure`'s own default, and include the refinement name when
        // present so callers can still tell which constraint failed.
        message: `Expected a value of type \`${struct.type}\`${
          failure.refinement ? ` with refinement \`${failure.refinement}\`` : ''
        }, but received: \`${SENSITIVE_REDACTED}\``,
        branch: new Array(failure.branch.length).fill(SENSITIVE_REDACTED),
      };
    }
  }

  return new Struct({
    ...struct,
    validator(value, context): ReturnType<Struct['validator']> {
      return redact(struct.validator(value, context));
    },
    refiner(value: Type, context): ReturnType<Struct['refiner']> {
      return redact(struct.refiner(value, context));
    },
    *entries(value: unknown, context: Context): ReturnType<Struct['entries']> {
      for (const [key, val, fieldStruct] of struct.entries(value, context)) {
        yield [key, val, wrapWithRedaction(fieldStruct as AnyStruct)];
      }
    },
  });
}

/**
 * Wrap a struct so that every failure it emits has any occurrence of
 * `parentObj` in `failure.branch` replaced with a sanitised copy where
 * `sensitiveKeys` are redacted. This prevents the parent object (which holds
 * secret field values) from leaking through sibling-field failures.
 *
 * The wrapping propagates recursively through `entries` so that failures from
 * deeply nested sibling structs are covered too.
 *
 * @param struct - The struct whose failures should be patched.
 * @param parentObj - The parent-object reference to look for in branch arrays.
 * @param sensitiveKeys - Keys to redact from `parentObj` when it appears.
 * @returns The wrapped struct.
 */
export function withRedactedBranch(
  struct: AnyStruct,
  parentObj: unknown,
  sensitiveKeys: string[],
): AnyStruct {
  // eslint-disable-next-line jsdoc/require-jsdoc
  function* redactBranch(failures: Iterable<Failure>): Iterable<Failure> {
    for (const failure of failures) {
      if (!isObject(parentObj)) {
        yield failure;
        continue;
      }

      // Locate this specific parent. If it isn't in the branch (e.g. the
      // failure came from a different scope), pass it through.
      const parentIndex = failure.branch.indexOf(parentObj);
      if (parentIndex === -1) {
        yield failure;
        continue;
      }

      // Sanitize the parent entry.
      const branch = [...failure.branch];
      branch[parentIndex] = redactKeys(parentObj, sensitiveKeys);

      // Walk backward through every ancestor in the branch. Each ancestor
      // holds a direct reference to the child below it - without this step,
      // outer objects would still expose the unredacted child through their
      // own properties (e.g. root.wrapper.secret would remain visible
      // even after wrapper was sanitised at branch[1]).
      //
      // For each level we use the original child reference to find which
      // property key points to it (via ===), then replace that entry with
      // the already-sanitised child from the patched branch.
      for (
        let ancestorIndex = parentIndex - 1;
        ancestorIndex >= 0;
        ancestorIndex--
      ) {
        const ancestor = branch[ancestorIndex];

        // No reference to update in this case.
        if (!isObject(ancestor)) {
          break;
        }

        // Keep the original child reference, so we can detect it.
        const child = failure.branch[ancestorIndex + 1];

        // The already-sanitised child from the patched branch.
        const childSanitized = branch[ancestorIndex + 1];

        if (Array.isArray(ancestor)) {
          const childIndex = ancestor.indexOf(child);
          if (childIndex === -1) {
            break;
          }
          const copy = [...ancestor];
          copy[childIndex] = childSanitized;
          branch[ancestorIndex] = copy;
        } else {
          const childKey = Object.keys(ancestor).find(
            (key) => ancestor[key] === child,
          );
          if (childKey === undefined) {
            break;
          }
          branch[ancestorIndex] = { ...ancestor, [childKey]: childSanitized };
        }
      }

      yield { ...failure, branch };
    }
  }

  return new Struct({
    ...struct,
    validator(value, context): ReturnType<Struct['validator']> {
      return redactBranch(struct.validator(value, context));
    },
    refiner(value, context): ReturnType<Struct['refiner']> {
      return redactBranch(struct.refiner(value, context));
    },
    // Propagate branch redaction recursively so that failures originating from
    // any depth inside a sibling struct are also sanitised.
    *entries(value: unknown, context: Context): ReturnType<Struct['entries']> {
      for (const entry of struct.entries(value, context)) {
        const [fieldKey, fieldValue, fieldStruct] = entry;
        yield [
          fieldKey,
          fieldValue,
          // `AnyStruct` is `Struct<any, any>`, while the tuple narrows only to
          // `Struct<any> | Struct<never>` (second generic left as `unknown`).
          // The cast is safe because both forms represent untyped structs at runtime.
          withRedactedBranch(
            fieldStruct as AnyStruct,
            parentObj,
            sensitiveKeys,
          ),
        ];
      }
    },
  });
}

/**
 * Wrap a struct so that any validation failure redacts the actual value from
 * the error message, `StructError.value`, and `StructError.branch`. Use this
 * for fields that hold secrets to prevent
 * sensitive material from leaking into error logs or external services.
 *
 * When composed with the `object()` or `type()` structs, sibling-field
 * failures will also have the parent object's sensitive keys redacted from
 * their branch.
 *
 * @example
 * ```ts
 * const MyStruct = object({ secret: sensitive(string()) });
 * assert({ secret: 123 }, MyStruct);
 * // throws: At path: secret -- Expected a value of type `string`,
 * //         but received: `***`
 * ```
 * @param struct - The struct to wrap.
 * @returns The wrapped struct with identical validation logic but redacted
 * failures.
 */
export function sensitive<Type, Schema>(
  struct: Struct<Type, Schema>,
): Struct<Type, Schema> {
  const wrapped = wrapWithRedaction(struct);

  // Brand the wrapped struct. The `Struct` constructor copies Symbol-keyed
  // properties on spread, so any wrapper (optional, nullable, exactOptional,
  // deprecated, ...) automatically inherits this brand without needing changes.
  Object.defineProperty(wrapped, SENSITIVE_BRAND, {
    value: true,
    enumerable: true,
    configurable: true,
    writable: false,
  });
  return wrapped;
}
