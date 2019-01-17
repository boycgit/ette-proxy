import { Request } from 'ette';
import { isString, isFunction, invariant, getPathFromUrl } from './util';

const isGlob = require('is-glob');
const micromatch = require('micromatch');

/**
 * 检查 context 是否和目标 path 匹配，用于决定是否对该 path 进行 proxy
 * 这个方法很重要的，其决定性作用，该方法返回 true 表示就对该 path 进行转发
 *
 * @export
 * @param {*} context - 前导符（或函数）
 * @param {string} path - 请求路径
 * @param {Request} req - req 对象
 * @returns {boolean}
 */
export function matchContext(
  context: any,
  uri: string,
  req?: Request
): boolean | void {
  // 需要将 path 中的查询字符串剔除掉
  const path = getPathFromUrl(uri);
  // single path
  if (isStringPath(context)) {
    return matchSingleStringPath(context, path);
  }
  // single glob path
  if (isGlob(context)) {
    return matchSingleGlobPath(context, path);
  }

  // multi path
  if (Array.isArray(context)) {
    if (context.every(isStringPath)) {
      return matchMultiPath(context, path);
    }
    if (context.every(isGlob)) {
      return matchMultiGlobPath(context, path);
    }

    // 不支持字符串和通配符混合的模式
    invariant(
      false,
      'Invalid context. Expecting something like: ["/api", "/ajax"] or ["/api/**", "!**.html"]'
    );
  }

  /**
   * 自定义函数匹配
   *  var filter = function (path, req) {
      return path.match('^/api') && req.method === 'GET'
    }
   */
  if (isFunction(context)) {
    return context(path, req);
  }

  // 如果 context 不正确就报错
  invariant(
    false,
    'Invalid context. Expecting something like: "/api" or ["/api", "/ajax"]'
  );
}

/**
 * 匹配 context 是 path 的开头字符
 * 比如 path : '/api/b/c/d.html', context 是： '/api' 就返回 true
 *
 * @param  {String} context '/api'
 * @param  {String} path     '/api/b/c/d.html' (pathname: /api/b/c/d.html)
 * @return {Boolean}
 */
function matchSingleStringPath(context, path) {
  return path.indexOf(context) === 0;
}

/**
 * @param pattern - 匹配模式，比如 '/api/**.html'
 * @param path - 目标 path 路径
 */
function matchSingleGlobPath(pattern, path) {
  var matches = micromatch(path, pattern);
  return matches && matches.length > 0;
}

function matchMultiGlobPath(patternList, path) {
  return matchSingleGlobPath(patternList, path);
}

function isStringPath(context) {
  return isString(context) && !isGlob(context);
}

/**
 * @param  {String} contextList ['/api', '/ajax']
 * @param  {String} path     '/api/b/c/d.html'
 * @return {Boolean}
 */
function matchMultiPath(contextList, path) {
  for (var i = 0; i < contextList.length; i++) {
    var context = contextList[i];
    if (matchSingleStringPath(context, path)) {
      return true;
    }
  }
  return false;
}
