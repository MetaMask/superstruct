import { defaulted, string, object, number } from '../../../src/index.js';

export const Struct = defaulted(
  object({
    title: string(),
    version: number(),
  }),
  {
    title: 'Untitled',
  },
);

export const data = {
  version: 0,
};

export const output = {
  title: 'Untitled',
  version: 0,
};

export const create = true;
