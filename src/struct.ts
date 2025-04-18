import type { Failure } from './error.js';
import { StructError } from './error.js';
import type { StructSchema } from './utils.js';
import { isObject, toFailures, shiftIterator, run } from './utils.js';

type StructParams<Type, Schema> = {
  type: string;
  schema: Schema;
  coercer?: Coercer | undefined;
  validator?: Validator | undefined;
  refiner?: Refiner<Type> | undefined;
  entries?: Struct<Type, Schema>['entries'] | undefined;
};

/**
 * `Struct` objects encapsulate the validation logic for a specific type of
 * values. Once constructed, you use the `assert`, `is` or `validate` helpers to
 * validate unknown input data against the struct.
 */
export class Struct<Type = unknown, Schema = unknown> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly TYPE!: Type;

  type: string;

  schema: Schema;

  coercer: (value: unknown, context: Context) => unknown;

  validator: (value: unknown, context: Context) => Iterable<Failure>;

  refiner: (value: Type, context: Context) => Iterable<Failure>;

  entries: (
    value: unknown,
    context: Context,
  ) => Iterable<[string | number, unknown, Struct<any> | Struct<never>]>;

  constructor(props: StructParams<Type, Schema>) {
    const {
      type,
      schema,
      validator,
      refiner,
      coercer = (value: unknown) => value,
      entries = function* () {
        /* noop */
      },
    } = props;

    this.type = type;
    this.schema = schema;
    this.entries = entries;
    this.coercer = coercer;

    if (validator) {
      this.validator = (value, context) => {
        const result = validator(value, context);
        return toFailures(result, context, this, value);
      };
    } else {
      this.validator = () => [];
    }

    if (refiner) {
      this.refiner = (value, context) => {
        const result = refiner(value, context);
        return toFailures(result, context, this, value);
      };
    } else {
      this.refiner = () => [];
    }
  }

  /**
   * Assert that a value passes the struct's validation, throwing if it doesn't.
   */

  assert(value: unknown, message?: string): asserts value is Type {
    return assert(value, this, message);
  }

  /**
   * Create a value with the struct's coercion logic, then validate it.
   */

  create(value: unknown, message?: string): Type {
    return create(value, this, message);
  }

  /**
   * Check if a value passes the struct's validation.
   */

  is(value: unknown): value is Type {
    return is(value, this);
  }

  /**
   * Mask a value, coercing and validating it, but returning only the subset of
   * properties defined by the struct's schema.
   */

  mask(value: unknown, message?: string): Type {
    return mask(value, this, message);
  }

  /**
   * Validate a value with the struct's validation logic, returning a tuple
   * representing the result.
   *
   * You may optionally pass `true` for the `withCoercion` argument to coerce
   * the value before attempting to validate it. If you do, the result will
   * contain the coerced result when successful.
   */

  validate(
    value: unknown,
    options: {
      coerce?: boolean;
      message?: string;
    } = {},
  ): [StructError, undefined] | [undefined, Type] {
    return validate(value, this, options);
  }
}

// String instead of a Symbol in case of multiple different versions of this library.
const ExactOptionalBrand = 'EXACT_OPTIONAL';

/**
 * An `ExactOptionalStruct` is a `Struct` that is used to create exactly optional
 * properties of `object()` structs.
 */
export class ExactOptionalStruct<
  Type = unknown,
  Schema = unknown,
> extends Struct<Type, Schema> {
  // ESLint wants us to make this #-private, but we need it to be accessible by
  // other versions of this library at runtime. If it were #-private, the
  // implementation would break if multiple instances of this library were
  // loaded at runtime.
  // eslint-disable-next-line no-restricted-syntax
  readonly brand: typeof ExactOptionalBrand;

  constructor(props: StructParams<Type, Schema>) {
    super({
      ...props,
      type: `exact optional ${props.type}`,
    });
    this.brand = ExactOptionalBrand;
  }

  static isExactOptional(value: unknown): value is ExactOptionalStruct {
    return (
      isObject(value) && 'brand' in value && value.brand === ExactOptionalBrand
    );
  }
}

/**
 * Assert that a value passes a struct, throwing if it doesn't.
 *
 * @param value - The value to validate.
 * @param struct - The struct to validate against.
 * @param message - An optional message to include in the error.
 */
export function assert<Type, Schema>(
  value: unknown,
  struct: Struct<Type, Schema>,
  message?: string,
): asserts value is Type {
  const result = validate(value, struct, { message });

  if (result[0]) {
    throw result[0];
  }
}

/**
 * Create a value with the coercion logic of struct and validate it.
 *
 * @param value - The value to coerce and validate.
 * @param struct - The struct to validate against.
 * @param message - An optional message to include in the error.
 * @returns The coerced and validated value.
 */
export function create<Type, Schema>(
  value: unknown,
  struct: Struct<Type, Schema>,
  message?: string,
): Type {
  const result = validate(value, struct, { coerce: true, message });

  if (result[0]) {
    throw result[0];
  } else {
    return result[1];
  }
}

/**
 * Mask a value, returning only the subset of properties defined by a struct.
 *
 * @param value - The value to mask.
 * @param struct - The struct to mask against.
 * @param message - An optional message to include in the error.
 * @returns The masked value.
 */
export function mask<Type, Schema>(
  value: unknown,
  struct: Struct<Type, Schema>,
  message?: string,
): Type {
  const result = validate(value, struct, { coerce: true, mask: true, message });

  if (result[0]) {
    throw result[0];
  } else {
    return result[1];
  }
}

/**
 * Check if a value passes a struct.
 *
 * @param value - The value to validate.
 * @param struct - The struct to validate against.
 * @returns `true` if the value passes the struct, `false` otherwise.
 */
export function is<Type, Schema>(
  value: unknown,
  struct: Struct<Type, Schema>,
): value is Type {
  const result = validate(value, struct);
  return !result[0];
}

/**
 * Validate a value against a struct, returning an error if invalid, or the
 * value (with potential coercion) if valid.
 *
 * @param value - The value to validate.
 * @param struct - The struct to validate against.
 * @param options - Optional settings.
 * @param options.coerce - Whether to coerce the value before validating it.
 * @param options.mask - Whether to mask the value before validating it.
 * @param options.message - An optional message to include in the error.
 * @returns A tuple containing the error (if invalid) and the validated value.
 */
export function validate<Type, Schema>(
  value: unknown,
  struct: Struct<Type, Schema>,
  options: {
    coerce?: boolean | undefined;
    mask?: boolean | undefined;
    message?: string | undefined;
  } = {},
): [StructError, undefined] | [undefined, Type] {
  const tuples = run(value, struct, options);
  const tuple = shiftIterator(tuples) as [
    Failure | undefined,
    Type | undefined,
  ];

  if (tuple[0]) {
    const error = new StructError(tuple[0], function* () {
      for (const innerTuple of tuples) {
        if (innerTuple[0]) {
          yield innerTuple[0];
        }
      }
    });

    return [error, undefined];
  }

  const validatedValue = tuple[1] as Type;
  return [undefined, validatedValue];
}

/**
 * A `Context` contains information about the current location of the
 * validation inside the initial input value.
 */

export type Context = {
  branch: any[];
  path: any[];
};

/**
 * A type utility to extract the type from a `Struct` class.
 */

export type Infer<StructType extends Struct<any, any>> = StructType['TYPE'];

/**
 * A type utility to describe that a struct represents a TypeScript type.
 */

export type Describe<Type> = Struct<Type, StructSchema<Type>>;

/**
 * A `Result` is returned from validation functions.
 */

export type Result =
  | boolean
  | string
  | Partial<Failure>
  | Iterable<boolean | string | Partial<Failure>>;

/**
 * A `Coercer` takes an unknown value and optionally coerces it.
 */

export type Coercer<Type = unknown> = (
  value: Type,
  context: Context,
) => unknown;

/**
 * A `Validator` takes an unknown value and validates it.
 */

export type Validator = (value: unknown, context: Context) => Result;

/**
 * A `Refiner` takes a value of a known type and validates it against a further
 * constraint.
 */

export type Refiner<Type> = (value: Type, context: Context) => Result;
