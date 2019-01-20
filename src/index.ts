import Application, { middlewareFunction, Request, IContext } from 'ette';

import { createConfig } from './config-factory';
import { createPathRewriter, TRewriter } from './path-rewriter';
import { matchContext } from './context-matcher';
import { debugMini, debugObject, debugError } from './debug';
import { proxy } from './proxy-ette';
import { invariant } from './util';

export interface IProxyConfigOptions {
  target?: Application;
  pathRewrite?: object;
  defer?: boolean; // 是否延时设置 target
}

export interface IProxyConfig {
  context?: any;
  options: IProxyConfigOptions;
}

export class EtteProxy {
  context?: any;
  options: IProxyConfigOptions;
  pathRewriter?: TRewriter;
  constructor(context, options) {
    // const config = (this.config = createConfig(context, opts));
    this.context = context;
    this.options = options;

    debugMini(
      `Proxy created: ${context} -> ${
        options.defer ? '[defer] unknown target' : options.target!.domain
      }`
    );

    // 相当于创建字符串替换规则
    this.pathRewriter = createPathRewriter(options.pathRewrite); // returns undefined when "pathRewrite" is not provided
  }

  /**
   * Determine whether request should be proxied.
   *
   * @private
   * @param  {Object} req     [description]
   * @return {Boolean}
   */
  shouldProxy = (req: Request) => {
    const { context } = this;
    var path = req.path;
    debugMini(`[judging proxy] request: ${path}`);

    return matchContext(context, path, req);
  };

  /**
   * Apply option.router and option.pathRewrite
   * Order matters:
   *    Router uses original path for routing;
   *    NOT the modified path, after it has been rewritten by pathRewrite
   * @param {Object} req
   * @return {Object} proxy options
   */
  prepareProxyRequest = req => {
    // https://github.com/chimurai/http-proxy-middleware/issues/17
    // https://github.com/chimurai/http-proxy-middleware/issues/94
    const { options } = this;

    // store uri before it gets rewritten for logging
    var originalPath = req.path;
    var newProxyOptions = Object.assign({}, options);

    // option.pathRewrite
    this.__applyPathRewrite(req, this.pathRewriter);

    debugMini(
      `命中代理规则： ${req.method} [${req.host}]${originalPath} ~~> [${
        newProxyOptions.target!.domain
      }]${req.path}`
    );

    return newProxyOptions;
  };

  /**
   * 真正执行 rewrite 逻辑的步骤，很重要，需要进行 try/catch 处理
   * 否则报错的信息会被吞没掉，导致 debug 成本上升
   *
   * @memberof EtteProxy
   */
  __applyPathRewrite = (req, pathRewriter) => {
    if (pathRewriter) {
      debugMini(`[__applyPathRewrite] 开始替换路径 ${req.path}`);

      // 做好 try/catch
      try {
        var path = pathRewriter(req.path, req); // 相当于根据规则替换字符串

        if (typeof path === 'string') {
          req.path = path;
          debugMini('proxy 成功');
        } else {
          debugMini('pathRewrite: No rewritten path found. (%s)', req.url);
        }
      } catch (err) {
        debugError(
          `[__applyPathRewrite] proxy 失败,替换路径出错：${JSON.stringify(err)}`
        );
      }
    }
  };

  updateTarget = (target: Application) => {
    invariant(target instanceof Application, '入参 target 必须是 ette 实例');
    this.options.target = target;
    debugMini(
      `target update [defer=${this.options.defer}]: ${(this.options.target &&
        this.options.target.domain) ||
        '[unset]'} -> ${target.domain}`
    );
    return this.middleware;
  };

  proxyMiddleware: middlewareFunction = async (
    ctx: IContext,
    next?: middlewareFunction
  ) => {
    const { request, response } = ctx;
    invariant(
      !!this.options.target,
      '[middleware] 缺少 "target" 选项. 使用前必须设置 target, 比如 proxy.setTarget(etteApp)'
    );
    if (this.shouldProxy(request)) {
      debugMini(`[shouldProxy] request: [${request.method}] ${request.url}`);
      const activeProxyOptions = this.prepareProxyRequest(request);
      const proxyResponse = await proxy(request, response, activeProxyOptions);
      debugObject(`proxy 返回的响应值: ${JSON.stringify(proxyResponse)}`);
      ctx.response.status = proxyResponse.status;
      ctx.response.body = proxyResponse.body;
    } else {
      debugMini(
        `[not shouldProxy] request: [${request.method}] ${request.url}`
      );
      next();
    }
  };

  get middleware() {
    return this.proxyMiddleware;
  }
}

export type TUpdateTargetFn = (target: Application) => middlewareFunction;
/**
 * 创建 proxy 实例 & 中间件
 * 若传入的 defer 是为 true，表示延迟设置 proxy 的 target，防止每次请求创建 EtteProxy 实例
 *
 * @export
 * @param {*} [context] - 匹配路径
 * @param {*} [opts] - 选项
 * @returns
 */
export default function(context?, opts?): TUpdateTargetFn | middlewareFunction {
  const config = createConfig(context, opts);
  const proxy = new EtteProxy(config.context, config.options);
  return !config.options.defer ? proxy.middleware : proxy.updateTarget;
}

export * from './config-factory';
export * from './path-rewriter';
export * from './context-matcher';
export * from './debug';
export * from './proxy-ette';
