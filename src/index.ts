import Application, { middlewareFunction, Request, IContext } from 'ette';

import { createConfig } from './config-factory';
import { createPathRewriter, TRewriter } from './path-rewriter';
import { matchContext } from './context-matcher';
import { debugMini, debugObject, debugError } from './debug';
import { proxy } from './proxy-ette';

export interface IProxyConfigOptions {
  target?: Application;
  pathRewrite?: object;
}

export interface IProxyConfig {
  context?: any;
  options: IProxyConfigOptions;
}

export class EtteProxy {
  config: IProxyConfig;
  pathRewriter?: TRewriter;
  constructor(context, opts) {
    const config = (this.config = createConfig(context, opts));

    const proxyOptions: IProxyConfigOptions = config.options;

    debugMini(
      `Proxy created: ${config.context} -> ${proxyOptions.target!.domain}`
    );

    // 相当于创建字符串替换规则
    this.pathRewriter = createPathRewriter(proxyOptions.pathRewrite); // returns undefined when "pathRewrite" is not provided
  }

  /**
   * Determine whether request should be proxied.
   *
   * @private
   * @param  {Object} req     [description]
   * @return {Boolean}
   */
  shouldProxy = (req: Request) => {
    const { config } = this;
    var path = req.path;
    debugMini(`[judging proxy] request: ${path}`);

    return matchContext(config.context, path, req);
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
    const { options } = this.config;

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
        debugMini('proxy 失败');

        debugError(`[__applyPathRewrite] 替换路径出错：${JSON.stringify(err)}`);
      }
    }
  };

  get middleware() {
    const self = this;
    return async function middleware(ctx: IContext, next: middlewareFunction) {
      const { request, response } = ctx;
      if (self.shouldProxy(request)) {
        debugMini(`[shouldProxy] request: [${request.method}] ${request.url}`);
        const activeProxyOptions = self.prepareProxyRequest(request);
        const proxyResponse = await proxy(
          request,
          response,
          activeProxyOptions
        );
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
  }
}

export default function(context?, opts?) {
  const proxy = new EtteProxy(context, opts);
  return proxy.middleware;
}

export * from './config-factory';
export * from './path-rewriter';
export * from './context-matcher';
export * from './debug';
export * from './proxy-ette';
