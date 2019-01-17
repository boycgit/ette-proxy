import { matchContext } from '../../src';
describe('[matchContext] 方法', function() {
  describe('string 类路径匹配', function() {
    var result;

    describe('单个路径匹配', function() {
      it('空字符串匹配所有路径', function() {
        result = matchContext('', '/api/foo/bar');
        expect(result).toBeTruthy();
      });

      it('单斜杆匹配根路径', function() {
        result = matchContext('/', '/api/foo/bar');
        expect(result).toBeTruthy();
      });

      it('当 context 出现在路径开始处将匹配成功', function() {
        result = matchContext('/api', '/api/foo/bar');
        expect(result).toBeTruthy();
      });

      it('当 context 未出现在路径中将匹配失败', function() {
        result = matchContext('/abc', '/api/foo/bar');
        expect(result).toBeFalsy();
      });

      it('当 context 出现在路径中（非开始就匹配）将返回 false', function() {
        result = matchContext('/foo', '/api/foo/bar');
        expect(result).toBeFalsy();
      });

      it('context 必须以 / 作为开始', function() {
        result = matchContext('api', '/api/foo/bar');
        expect(result).toBeFalsy();
      });
    });

    describe('多路径匹配', function() {
      it('当 context 出现在路径中将匹配成功', function() {
        result = matchContext(['/api'], '/api/foo/bar');
        expect(result).toBeTruthy();
      });

      it('只要有一条成功就算匹配成功', function() {
        result = matchContext(['/api', '/ajax'], '/ajax/foo/bar');
        expect(result).toBeTruthy();
      });

      it('只有当而所有的都没有匹配上才返回 false', function() {
        result = matchContext(['/api', '/ajax'], '/foo/bar');
        expect(result).toBeFalsy();
      });

      it('空数组直接返回 false', function() {
        result = matchContext([], '/api/foo/bar');
        expect(result).toBeFalsy();
      });
    });
  });

  describe('通配符路径匹配', function() {
    describe('单个通配符', function() {
      var url;

      beforeEach(function() {
        url = '/api/foo/bar.html';
      });

      describe('url-path 匹配', function() {
        it('should match any path', function() {
          expect(matchContext('**', url)).toBeTruthy();
          expect(matchContext('/**', url)).toBeTruthy();
        });

        it('只有以 "/api" 开头的通配符才能匹配成功', function() {
          expect(matchContext('/api/**', url)).toBeTruthy();
          expect(matchContext('/ajax/**', url)).toBeFalsy();
        });

        it('只有路径中含有 "foo" 的通配符才能匹配成功 ', function() {
          expect(matchContext('**/foo/**', url)).toBeTruthy();
          expect(matchContext('**/invalid/**', url)).toBeFalsy();
        });
      });

      describe('文件级别匹配', function() {
        it('匹配任何路径、文件和扩展名的通配符', function() {
          expect(matchContext('**', url)).toBeTruthy();
          expect(matchContext('**/*', url)).toBeTruthy();
          expect(matchContext('**/*.*', url)).toBeTruthy();
          expect(matchContext('/**', url)).toBeTruthy();
          expect(matchContext('/**/*', url)).toBeTruthy();
          expect(matchContext('/**/*.*', url)).toBeTruthy();
        });

        it('只能匹配 .html 文件的通配符', function() {
          expect(matchContext('**/*.html', url)).toBeTruthy();
          expect(matchContext('/**/*.html', url)).toBeTruthy();
          expect(matchContext('/*.htm', url)).toBeFalsy();
          expect(matchContext('/*.jpg', url)).toBeFalsy();
        });

        it('只能匹配根目录下 .html 的通配符', function() {
          var pattern = '/*.html';
          expect(matchContext(pattern, '/index.html')).toBeTruthy();
          expect(matchContext(pattern, '/some/path/index.html')).toBeFalsy();
        });

        it('匹配过程中会忽略 query 查询串', function() {
          expect(matchContext('/**/*.php', '/a/b/c.php?d=e&e=f')).toBeTruthy();
          expect(matchContext('/**/*.php?*', '/a/b/c.php?d=e&e=f')).toBeFalsy();
        });

        it('只匹配根目录下文件的通配符', function() {
          expect(matchContext('/*', '/bar.html')).toBeTruthy();
          expect(matchContext('/*.*', '/bar.html')).toBeTruthy();
          expect(matchContext('/*', '/foo/bar.html')).toBeFalsy();
        });

        it('只匹配根目录下的 .html 文件的通配符', function() {
          expect(matchContext('/*.html', '/bar.html')).toBeTruthy();
          expect(matchContext('/*.html', '/api/foo/bar.html')).toBeFalsy();
        });

        it('只匹配 "foo" 文件夹下的 .html 文件', function() {
          expect(matchContext('**/foo/*.html', url)).toBeTruthy();
          expect(matchContext('**/bar/*.html', url)).toBeFalsy();
        });

        it('不匹配 .html 文件的通配符', function() {
          expect(matchContext('!**/*.html', url)).toBeFalsy();
        });
      });
    });

    describe('多个通配符场景', function() {
      describe('多种匹配方式', function() {
        it('路径匹配，当符合其中一条匹配规则就算匹配成功', function() {
          var pattern = ['/api/**', '/ajax/**'];
          expect(matchContext(pattern, '/api/foo/bar.json')).toBeTruthy();
          expect(matchContext(pattern, '/ajax/foo/bar.json')).toBeTruthy();
          expect(matchContext(pattern, '/rest/foo/bar.json')).toBeFalsy();
        });
        it('文件扩展名匹配，当符合其中一条匹配规则就算匹配成功', function() {
          var pattern = ['/**/*.html', '/**/*.jpeg'];
          expect(matchContext(pattern, '/api/foo/bar.html')).toBeTruthy();
          expect(matchContext(pattern, '/api/foo/bar.jpeg')).toBeTruthy();
          expect(matchContext(pattern, '/api/foo/bar.gif')).toBeFalsy();
        });
      });

      describe('反向匹配', function() {
        it('应当匹配成功', function() {
          var url = '/api/foo/bar.html';
          expect(matchContext(['**', '!**/*.html'], url)).toBeFalsy();
          expect(matchContext(['**', '!**/*.json'], url)).toBeTruthy();
        });
      });
    });
  });

  describe('使用函数进行匹配', function() {
    var testFunctionAsContext = function(val?) {
      return matchContext(fn, '/api/foo/bar');

      function fn(path, req) {
        return val;
      }
    };

    describe('匹配成功的场景', function() {
      it('当函数返回 true 的时候表明匹配成功', function() {
        expect(testFunctionAsContext(true)).toBeTruthy();
        expect(testFunctionAsContext('true')).toBeTruthy();
      });
    });

    describe('匹配失败的场景', function() {
      it('当函数返回 false 的时候表明匹配成功', function() {
        expect(testFunctionAsContext()).toBeFalsy();
        expect(testFunctionAsContext(undefined)).toBeFalsy();
        expect(testFunctionAsContext(false)).toBeFalsy();
        expect(testFunctionAsContext('')).toBeFalsy();
      });
    });
  });

  describe('边界测试，匹配报错的场景', function() {
    var testContext;

    beforeEach(function() {
      testContext = function(context) {
        return function() {
          matchContext(context, '/api/foo/bar');
        };
      };
    });

    describe('抛出错误', function() {
      it('当 context 为 undefined 时抛出错误', function() {
        expect(testContext(undefined)).toThrow(Error);
      });

      it('当 context 为 null 时抛出错误', function() {
        expect(testContext(null)).toThrow(Error);
      });

      it('当 context 为 对象字面量 时抛出错误', function() {
        expect(testContext({})).toThrow(Error);
      });

      it('当 context 为 数字 时抛出错误', function() {
        expect(testContext(123)).toThrow(Error);
      });

      it('context 既包含 string 又包含 通配符 时也会报错', function() {
        expect(testContext(['/api', '!*.html'])).toThrow(Error);
      });
    });

    describe('不会抛出错误', function() {
      it('若是 string, 则不会抛出错误', function() {
        expect(testContext('/123')).not.toThrow(Error);
      });

      it('若是 数组, 则不会抛出错误', function() {
        expect(testContext(['/123'])).not.toThrow(Error);
      });
      it('若是 通配符, 则不会抛出错误', function() {
        expect(testContext('/**')).not.toThrow(Error);
      });

      it('若是 通配符数组, 则不会抛出错误', function() {
        expect(testContext(['/**', '!*.html'])).not.toThrow(Error);
      });

    it('若是 函数, 则不会抛出错误', function() {
        expect(testContext(function() {})).not.toThrow(Error);
      });
    });
  });
});
