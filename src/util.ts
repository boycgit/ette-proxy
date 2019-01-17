export function invariant(
  check: boolean,
  message: string,
  thing?: string
): void | never {
  if (!check) {
    throw new Error(
      '[ette-proxy] Invariant failed: ' +
        message +
        (thing ? " in '" + thing + "'" : '')
    );
  }
}

// see: https://30secondsofcode.org/type#is
export const isEmpty = val => val == null || !(Object.keys(val) || val).length;
export const isPlainObject = val =>
  !!val && typeof val === 'object' && val.constructor === Object;
export const isFunction = val => typeof val === 'function';
export const isNil = val => val === undefined || val === null;
export const isEmptyObject = obj =>
  Object.keys(obj).length === 0 && obj.constructor === Object;
export const isString = val => typeof val === 'string';

// https://stackoverflow.com/questions/2540969/remove-querystring-from-url
export function getPathFromUrl(url) {
  return url.split(/[?#]/)[0];
}
