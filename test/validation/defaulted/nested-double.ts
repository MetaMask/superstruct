import { defaulted, string, object } from '../../../src';

export const Struct = object({
  book: defaulted(
    object({
      title: defaulted(string(), 'Untitled'),
    }),
    {},
  ),
});

export const data = {};

export const output = {
  book: {
    title: 'Untitled',
  },
};

export const create = true;
