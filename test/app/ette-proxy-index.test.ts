import Ette, { Request, Response } from 'ette';
import Router from 'ette-router';

import proxy from '../../src/index';

const ORI_SERVERNAME = 'fromServer';
const PROXY_SERVERNAME = 'proxyServer';

console.log(999, Ette);
describe('[EtteProxy] 构造函数', function() {
  let app, proxyApp, router, client;

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

  test('创建的 proxy 是中间件函数', () => {
    const proxyConfig = {
      target: proxyApp
    };

    const middleware = proxy(proxyConfig);
    expect(middleware).toBeInstanceOf(Function);
  });

  test('context 没匹配上则不会代理', () => {
    const proxyConfig = {
      target: proxyApp
    };

    let isSkipped = false;
    const mockNext = function() {
      // mockNext will be called when request is not proxied
      isSkipped = true;
    };

    const middleware = proxy('/api', proxyConfig);
    (middleware as any)(
      {
        request: new Request({ url: '/foo/bar' }),
        response: {}
      } as any,
      mockNext as any
    );

    expect(isSkipped).toBeTruthy();
  });

  test('context 匹配上则进行代理', () => {
    const proxyConfig = {
      target: proxyApp
    };

    let isSkipped = false;
    const mockNext = function() {
      // mockNext will be called when request is not proxied
      isSkipped = true;
    };

    const middleware = proxy('/foo', proxyConfig);
    (middleware as any)(
      {
        request: new Request({ url: '/foo/bar' }),
        response: {}
      } as any,
      mockNext as any
    );

    expect(isSkipped).toBeFalsy();
  });

  test('自定义 context 匹配', function(done) {
    let filterPath, filterReq;
    let domain = ORI_SERVERNAME;
    const filter = function(path, req) {
      filterPath = path;
      filterReq = req;
      return true;
    };

    const proxyConfig = {
      target: proxyApp
    };
    // 需要先挂载代理中间件，否则就错过了
    app.use(proxy(filter, proxyConfig));

    // 然后再分别挂载路由
    app.use(router.routes());

    const mockNext = function() {
      // mockNext will be called when request is not proxied
      domain = PROXY_SERVERNAME;
    };

    proxyApp.use(router.routes());
    proxyApp.use(mockNext);

    client.get('/api/b/c/d').then(function() {
      expect(filterPath).toBe('/api/b/c/d');
      expect(filterReq.method).toBe('GET');
      expect(domain).toBe(PROXY_SERVERNAME);
      done();
    });
  });

  describe('多路径匹配场景', () => {
    let reqPath = '';

    beforeEach(() => {
      // 代理服务器中的逻辑
      const mwTarget = function(ctx, next) {
        reqPath = ctx.request.path;
      };

      // 先挂载中间件
      proxyApp.use(mwTarget);
    });

    afterEach(() => {
      reqPath = '';
    });

    test('支持多路径匹配 - case 1', done => {
      const mwProxy = proxy(['/api', '/ajax'], {
        target: proxyApp
      });

      app.use(mwProxy);

      client.get('/api/some/endpoint').then(function() {
        expect(reqPath).toBe('/api/some/endpoint');
        done();
      });
    });

    test('支持多路径匹配 - case 2', done => {
      const mwProxy = proxy(['/api', '/ajax'], {
        target: proxyApp
      });

      app.use(mwProxy);

      client.get('/ajax/some/library').then(function() {
        expect(reqPath).toBe('/ajax/some/library');
        done();
      });
    });

    test('没匹配到的路径不会进行响应', done => {
      const mwProxy = proxy(['/api', '/ajax'], {
        target: proxyApp
      });

      // 需要先挂载代理中间件，否则就错过了
      app.use(mwProxy);

      client.get('/lorum/ipsum/endpoint').then(function() {
        expect(reqPath).toBe('');
        done();
      });
    });
  });

  describe('通配符匹配场景', () => {
    let reqPath = '';

    beforeEach(() => {
      // 代理服务器中的逻辑
      const mwTarget = function(ctx, next) {
        reqPath = ctx.request.path;
      };

      // 先挂载中间件
      proxyApp.use(mwTarget);
    });

    afterEach(() => {
      reqPath = '';
    });

    test('支持通配符匹配', done => {
      const mwProxy = proxy('/api/**', {
        target: proxyApp
      });

      app.use(mwProxy);

      client.get('/api/some/endpoint').then(function() {
        expect(reqPath).toBe('/api/some/endpoint');
      });

      client.get('/api/ajax/some').then(function() {
        expect(reqPath).toBe('/api/ajax/some');
        done();
      });
    });

    test('没匹配到的路径不会进行响应', done => {
      const mwProxy = proxy('/api/**', {
        target: proxyApp
      });

      // 需要先挂载代理中间件，否则就错过了
      app.use(mwProxy);

      client.get('/lorum/ipsum/endpoint').then(function() {
        expect(reqPath).toBe('');
        done();
      });
    });
  });

  describe('多个通配符匹配场景', () => {
    let reqPath = '';

    beforeEach(() => {
      // 代理服务器中的逻辑
      const mwTarget = function(ctx, next) {
        reqPath = ctx.request.path;
      };

      // 先挂载中间件
      proxyApp.use(mwTarget);
    });

    afterEach(() => {
      reqPath = '';
    });

    test('支持通配符匹配', done => {
      const mwProxy = proxy(['**/*.html', '!**.json'], {
        target: proxyApp
      });

      app.use(mwProxy);

      client.get('/api/some/endpoint/index.html').then(function() {
        expect(reqPath).toBe('/api/some/endpoint/index.html');
        done();
      });
    });

    test('支持通配符中的否定匹配', done => {
      const mwProxy = proxy(['**/*.html', '!**.json'], {
        target: proxyApp
      });

      app.use(mwProxy);

      client.get('/api/some/endpoint/data.json').then(function() {
        expect(reqPath).toBe('');
        done();
      });
    });

    test('没匹配到的路径不会进行响应', done => {
      const mwProxy = proxy(['**/*.html', '!**.json'], {
        target: proxyApp
      });

      // 需要先挂载代理中间件，否则就错过了
      app.use(mwProxy);

      client.get('/api/some/endpoint/data').then(function() {
        expect(reqPath).toBe('');
        done();
      });
    });
  });
});
