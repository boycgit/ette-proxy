# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.2.4"></a>
## [0.2.4](https://github.com/boycgit/ette-proxy/compare/v0.2.3...v0.2.4) (2019-03-11)


### Bug Fixes

* **proxy 顺序:** 使用 await 关键字，确保异步流程的顺序 ([aaa75e2](https://github.com/boycgit/ette-proxy/commit/aaa75e2))



<a name="0.2.3"></a>
## [0.2.3](https://github.com/boycgit/ette-proxy/compare/v0.2.2...v0.2.3) (2019-02-13)


### Bug Fixes

* **打包配置:** 将 rollup 更改成 webpack 打包，只生成 umd.js 格式的输出文件 ([53e03cc](https://github.com/boycgit/ette-proxy/commit/53e03cc))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/boycgit/ette-proxy/compare/v0.2.1...v0.2.2) (2019-02-12)


### Bug Fixes

* **打包输出:** 更改 rollup 打包配置项，生成合法的 umd.js 文件 ([a14c7d7](https://github.com/boycgit/ette-proxy/commit/a14c7d7))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/boycgit/ette-proxy/compare/v0.2.0...v0.2.1) (2019-02-12)


### Bug Fixes

* **bugfix:** 使用 isEtteApplication 代替 instanceof 来判断是否是 ette 应用 ([07eb289](https://github.com/boycgit/ette-proxy/commit/07eb289))
* **bugfix:** 使用 targetUrl 来代替 req.url ([fc3ada9](https://github.com/boycgit/ette-proxy/commit/fc3ada9))
* **bugfix:** 转发请求的时候，需要带上原始请求的 data 和 type 字段 ([e2cd4da](https://github.com/boycgit/ette-proxy/commit/e2cd4da))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/boycgit/ette-proxy/compare/v0.1.4...v0.2.0) (2019-01-20)



<a name="0.1.4"></a>
## [0.1.4](https://github.com/boycgit/ette-proxy/compare/v0.1.3...v0.1.4) (2019-01-20)


### Bug Fixes

* **bugfix:** 将 next 参数调整为非必选项后，增加 next 的存在性判断 ([997ec23](https://github.com/boycgit/ette-proxy/commit/997ec23))



<a name="0.1.3"></a>
## [0.1.3](https://github.com/boycgit/ette-proxy/compare/v0.1.2...v0.1.3) (2019-01-20)


### Features

* **功能增强:** 新增 defer 参数，支持延后传入 ette app 实例，提高代码复用率；提取 proxyMiddleware 函数，减少匿名函数非必要的生成； ([25b167a](https://github.com/boycgit/ette-proxy/commit/25b167a))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/boycgit/ette-proxy/compare/v0.1.1...v0.1.2) (2019-01-18)


### Bug Fixes

* **打包配置:** 修复无法正确打包的问题；调整变量声明； ([f51df05](https://github.com/boycgit/ette-proxy/commit/f51df05))



<a name="0.1.1"></a>
## 0.1.1 (2019-01-18)


### Features

* **功能完善:** 完成第一个可投入使用版本；完善单元测试用例，整体单元测试覆盖率达到 98.8% ([464f272](https://github.com/boycgit/ette-proxy/commit/464f272))
* **功能新增:** 从 http-proxy-middleware 迁移代理功能；完善单元测试用例；适配 ette 、ette-router 两个库 ([815876b](https://github.com/boycgit/ette-proxy/commit/815876b))
