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

  invariant(
    !!config.options.target,
    '缺少 "target" 选项. Example: {target: etteApp}'
  );

  return config;
}

function isContextless(context, opts) {
  return isPlainObject(context) && isEmpty(opts);
}
