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
    router.get('/sub/api/user', function(ctx) {
      const query = ctx.request.query;
      ctx.response.body = {
        domain: ctx.app.domain,
        filter: query && query.filter
      };
      ctx.response.status = 204;
    });

    // 该路径不会被代理
    router.get('/sub/user', function(ctx) {
      const query = ctx.request.query;
      ctx.response.body = {
        domain: ctx.app.domain,
        filter: query && query.filter
      };
      ctx.response.status = 200;
    });

    proxyApp = new Ette({ domain: PROXY_SERVERNAME });
  });

  test('没有代理场景', function(done) {
    // 挂载路由
    app.use(router.routes());
    proxyApp.use(router.routes());

    client.get('/sub/api/user?filter=one').then(res => {
      const { domain, filter } = res.body;
      expect(domain).toBe(ORI_SERVERNAME);
      expect(filter).toBe('one');
      expect(res.status).toBe(204);
    });

    client.get('/sub/user?filter=two').then(res => {
      const { domain, filter } = res.body;
      expect(domain).toBe(ORI_SERVERNAME);
      expect(filter).toBe('two');
      expect(res.status).toBe(200);
      done();
    });
  });
  describe('代理子路由', () => {
    // 自定义匹配规则
    function contextFn(pathname, req) {
      var urlFilter = new RegExp('^/sub/api');
      var match = urlFilter.test(pathname);
      return match;
    }

    test('通过 router 注册中间件进行代理', function(done) {
      const proxyConfig = {
        target: proxyApp
      };
      // 路由挂载代理中间件
      router.use(proxy(contextFn, proxyConfig));

      // 挂载路由
      app.use(router.routes());
      proxyApp.use(router.routes());

      client.get('/sub/api/user?filter=one').then(res => {
        const { domain, filter } = res.body;
        expect(domain).toBe(PROXY_SERVERNAME);
        expect(filter).toBe('one');
        expect(res.status).toBe(204);
      });

      client.get('/sub/user?filter=two').then(res => {
        const { domain, filter } = res.body;
        expect(domain).toBe(ORI_SERVERNAME);
        expect(filter).toBe('two');
        expect(res.status).toBe(200);
        done();
      });
    });

    test('通过 app 注册中间件进行代理', function(done) {
      const proxyConfig = {
        target: proxyApp
      };
      // app 上挂载代理中间件
      app.use(proxy(contextFn, proxyConfig));

      // 挂载路由
      app.use(router.routes());
      proxyApp.use(router.routes());

      client.get('/sub/api/user?filter=one').then(res => {
        const { domain, filter } = res.body;
        expect(domain).toBe(PROXY_SERVERNAME);
        expect(filter).toBe('one');
        expect(res.status).toBe(204);
      });

      client.get('/sub/user?filter=two').then(res => {
        const { domain, filter } = res.body;
        expect(domain).toBe(ORI_SERVERNAME);
        expect(filter).toBe('two');
        expect(res.status).toBe(200);
        done();
      });
    });
  });
});
