import { createConfig } from '../../src/index';
describe('[createConfig]', function() {
  var result;

  describe('createConfig 方法', function() {
    describe('典型的 config 方式', function() {
      var context = '/api';
      var options = { target: 'http://www.example.org' };

      beforeEach(function() {
        result = createConfig(context, options);
      });

      it('返回配置项对象', function() {
        expect(result).toHaveProperty('context');
        expect(result).toHaveProperty('options');
      });

      it('返回的配置项对象中包含 `context` 属性', function() {
        expect(result.context).toEqual(context);
      });

      it('返回的配置项对象中包含 `options` 属性', function() {
        expect(result.options).toEqual(options);
      });
    });

    describe('必须存在 option.target 属性', function() {
      var fn;

      beforeEach(function() {
        fn = function() {
          createConfig({});
        };
      });

      it('当 target option 不存在的时候，抛出错误', function() {
        expect(fn).toThrow(Error);
      });
    });
  });
});
