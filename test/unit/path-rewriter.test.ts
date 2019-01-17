import { createPathRewriter } from '../../src';
describe('Path rewriting', function() {
  var rewriter;
  var result;
  var config;

    describe('[createPathRewriter] Rewrite 规则配置以及使用', function() {
    beforeEach(function() {
      config = {
        '^/api/old': '/api/new',
        '^/remove': '',
        invalid: 'path/new',
        '/valid': '/path/new',
        '/some/specific/path': '/first/some/specific/path', // 先匹配到的话，后续的就不会再进行匹配了，所以详细具体的配置放在最前面
        '/some': '/second/some'
      };
    });

    beforeEach(function() {
      rewriter = createPathRewriter(config);
    });

    it('应该 rewrite 的情况', function() {
      result = rewriter('/api/old/index.json');
      expect(result).toEqual('/api/new/index.json');
    });

    it('应该 remove 的情况', function() {
      result = rewriter('/remove/old/index.json');
      expect(result).toEqual('/old/index.json');
    });

    it('未匹配的路径应毫发无损', function() {
      result = rewriter('/foo/bar/index.json');
      expect(result).toEqual('/foo/bar/index.json');
    });

    it('should not rewrite path when config-key does not match url with test(regex)', function() {
      result = rewriter('/invalid/bar/foo.json');
      expect(result).toEqual('/path/new/bar/foo.json');
      expect(result).not.toEqual('/invalid/new/bar/foo.json');
    });

    it('如果能通过 test(regex) 匹配路径，需要使用 config-key 去替换路径', function() {
      result = rewriter('/valid/foo/bar.json');
      expect(result).toEqual('/path/new/foo/bar.json');
    });

    it('多条规则都满足匹配时，只针对第一条匹配项生效', function() {
      result = rewriter('/some/specific/path/bar.json');
      expect(result).toEqual('/first/some/specific/path/bar.json');
    });
  });

describe('[createPathRewriter] 新增 base 路径的方式', function() {
    beforeEach(function() {
      config = {
        '^/': '/extra/base/path/'
      };
    });

    beforeEach(function() {
      rewriter = createPathRewriter(config);
    });

    it('应当给请求的 url 新增 base path', function() {
      result = rewriter('/api/books/123');
      expect(result).toEqual('/extra/base/path/api/books/123');
    });
  });

    describe('[createPathRewriter] 使用 function 方式', function() {
    var rewriter;

    beforeEach(function() {
      rewriter = function(fn) {
        var rewriteFn = createPathRewriter(fn);
        var requestPath = '/123/456';
        return (rewriteFn as any)(requestPath);
      };
    });

    it('应当返回无更改的路径', function() {
      var rewriteFn = function(path) {
        return path;
      };

      expect(rewriter(rewriteFn)).toEqual('/123/456');
    });

    it('应当返回替代路径', function() {
      var rewriteFn = function(path) {
        return '/foo/bar';
      };

      expect(rewriter(rewriteFn)).toEqual('/foo/bar');
    });

    it('应当返回部分被替换后的路径', function() {
      var rewriteFn = function(path) {
        return path.replace('/456', '/789');
      };

      expect(rewriter(rewriteFn)).toEqual('/123/789');
    });
  });

    describe('[createPathRewriter] 边界项测试', function() {
    var badFn;

    beforeEach(function() {
      badFn = function(config) {
        return function() {
          createPathRewriter(config);
        };
      };
    });

    it('没提供 config 时，将返回 undefined', function() {
      expect(badFn()()).toEqual(undefined);
      expect(badFn(null)()).toEqual(undefined);
      expect(badFn(undefined)()).toEqual(undefined);
    });

    it('非法配置项将抛出异常', function() {
      expect(badFn(123)).toThrow(Error);
      expect(badFn('abc')).toThrow(Error);
      expect(badFn([])).toThrow(Error);
      expect(badFn([1, 2, 3])).toThrow(Error);
    });

    it('当提供空对象时，不抛出错误', function() {
      expect(badFn({})).not.toThrow(Error);
    });

    it('当提供 function 时，也不会报错', function() {
        expect(badFn(function () { })).not.toThrow(Error);
    });
  });
});
