import { isPlainObject, isEmpty, invariant } from './util';
import { IProxyConfig } from './index';

export function createConfig(context: any, opts?: object): IProxyConfig {
  const config: IProxyConfig = {
    context: '',
    options: {}
  };

  // app.use(proxy({target: etteApp}));
  if (isContextless(context, opts)) {
    config.context = '/';
    config.options = Object.assign({}, context);
  } else {
    config.context = context;
    config.options = Object.assign({}, config.options, opts);
  }


  // 非 defer 状态下，需要确保 target 已被设置
  if (!config.options.defer) {
    invariant(
      !!config.options.target,
      '缺少 "target" 选项. Example: {target: etteApp}'
    );
  }


  return config;
}

function isContextless(context, opts) {
  return isPlainObject(context) && isEmpty(opts);
}
