import Ette from 'ette';
import Router from 'ette-router';

import proxy from '../../src/index';

describe('在 ette-router 中使用', function() {
  let app, proxyApp, router, client;
  const ORI_SERVERNAME = 'fromServer';
  const PROXY_SERVERNAME = 'proxyServer';

  beforeEach(() => {
    app = new Ette({ domain: ORI_SERVERNAME });
    router = new Router();
    client = app.client;

    // 该路径会被代理
    router.get('normal-router', '/sub/api/user', function(ctx) {
      const query = ctx.request.query;
      ctx.response.body = {
        domain: ctx.app.domain,
        path: ctx.request.path,
        filter: query && query.filter
      };
      ctx.response.status = 204;
    });

    // 该路径会被代理
    router.get('proxed-router', '/api/user', function(ctx) {
      const query = ctx.request.query;
      ctx.response.body = {
        domain: ctx.app.domain,
        path: ctx.request.path,
        filter: query && query.filter
      };
      ctx.response.status = 200;
    });

    proxyApp = new Ette({ domain: PROXY_SERVERNAME });
  });

  test('使用 rules table 进行 rewrite', done => {
    var proxyConfig = {
      target: proxyApp,
      pathRewrite: {
        '^/sub/api/': '/api/'
      }
    };

    // 需要先挂载代理中间件，否则就错过了
    app.use(proxy(proxyConfig));

    // 然后再分别挂载路由
    app.use(router.routes());
    proxyApp.use(router.routes());

    // 该路径会被代理
    client.get('/sub/api/user?filter=one').then(res => {
      const { domain, filter, path } = res.body;
      expect(domain).toBe(PROXY_SERVERNAME);
      expect(path).toBe('/api/user');
      expect(filter).toBe('one');
      expect(res.status).toBe(200);
      done();
    });
  });

  test.only('使用 函数 进行 rewrite', done => {
    let domainBefore = '';
    var proxyConfig = {
      target: proxyApp,
      pathRewrite: function(path, req) {
        domainBefore = req.host;
        return path.replace('/sub', '');
      }
    };

    // 需要先挂载代理中间件，否则就错过了
    app.use(proxy(proxyConfig));

    // 然后再分别挂载路由
    app.use(router.routes());
    proxyApp.use(router.routes());

    // 该路径会被代理
    client.get('/sub/api/user?filter=one').then(res => {
      const { domain, filter, path } = res.body;
      expect(domain).toBe(PROXY_SERVERNAME);
      expect(path).toBe('/api/user');
      expect(filter).toBe('one');
      expect(res.status).toBe(200);
      expect(domainBefore).toBe(ORI_SERVERNAME.toLocaleLowerCase());

      done();
    });
  });
});
