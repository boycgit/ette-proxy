import Application, { Request, Response } from 'ette';
import { IProxyConfigOptions } from './index';
import { debugMini } from './debug';

/**
 * 真正执行 proxy 功能的方法
 *
 * @export
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @param {IProxyConfigOptions} options - 代理选项
 */
export async function proxy(
  req: Request,
  res: Response,
  options: IProxyConfigOptions
) {
  const target: Application = options.target!;
  debugMini(
    `proxing to [${req.method}]url: [${target.domain}]${req.url}, original res: ${JSON.stringify(
      res.toJSON()
    )}`
  );
  return await target.client[req.method.toLocaleLowerCase()](
    req.url
  );
}
