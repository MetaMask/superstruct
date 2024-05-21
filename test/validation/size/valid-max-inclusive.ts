import { string, size } from '../../../src/index.js';

export const Struct = size(string(), 1, 5);

export const data = 'abcde';

export const output = 'abcde';
