import {
  isPlainObject,
  isEmpty,
  isFunction,
  isNil,
  isEmptyObject,
  invariant
} from './util';
import { debugMini } from './debug';
import { Request } from 'ette';

export type TRewriter = (path: string, req?: Request) => boolean;
/**
 * Create rewrite function, to cache parsed rewrite rules.
 * @param rewriteConfig - rewrite 配置项
 */
export function createPathRewriter(
  rewriteConfig?: object | TRewriter
): TRewriter | undefined {
  let rulesCache;

  if (!isValidRewriteConfig(rewriteConfig)) {
    return;
  }

  if (isFunction(rewriteConfig)) {
    return rewriteConfig as TRewriter;
  } else {
    rulesCache = parsePathRewriteRules(rewriteConfig);
    return rewritePath;
  }

  function rewritePath(path) {
    var result = path;

    rulesCache.some((rule: IRule) => {
      if (rule.regex.test(path)) {
        result = result.replace(rule.regex, rule.value);
        debugMini(`Rewriting path from ${path} to ${result}`);
        return true;
      }
      return false;
    });

    return result;
  }
}

function isValidRewriteConfig(rewriteConfig): boolean | never {
  if (isFunction(rewriteConfig)) {
    return true;
  } else if (!isEmpty(rewriteConfig) && isPlainObject(rewriteConfig)) {
    return true;
  } else if (isNil(rewriteConfig) || isEmptyObject(rewriteConfig)) {
    return false;
  } else {
    return invariant(
      false,
      '[ette-proxy] Invalid pathRewrite config. Expecting object with pathRewrite config or a rewrite function'
    ) as never;
  }
}

interface IRule {
  regex: RegExp;
  value: string;
}
function parsePathRewriteRules(rewriteConfig) {
  const rules: IRule[] = [];

  if (isPlainObject(rewriteConfig)) {
    Object.keys(rewriteConfig).forEach(key => {
      rules.push({
        regex: new RegExp(key),
        value: rewriteConfig[key]
      });
      debugMini(
        'Proxy rewrite 规则创建成功: "%s" ~> "%s"',
        key,
        rewriteConfig[key]
      );
    });
  }

  return rules;
}
