import { union, string, number, defaulted } from '../../../src/index.js';

const First = defaulted(string(), 'foo');
const Second = number();

export const Struct = union([First, Second]);

export const data = undefined;

export const output = 'foo';

export const create = true;
