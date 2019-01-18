# ette-proxy

[![Build Status](https://travis-ci.org/boycgit/ette-proxy.svg?branch=master)](https://travis-ci.org/boycgit/ette-proxy) [![Coverage Status](https://coveralls.io/repos/github/boycgit/ette-proxy/badge.svg?branch=master)](https://coveralls.io/github/boycgit/ette-proxy?branch=master)[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php) [![npm version](https://badge.fury.io/js/ette-proxy.svg)](https://badge.fury.io/js/ette-proxy)

Proxy middleware for ette. inspired by [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)

 - written in Typescript
 - used with koa style
 - fully tested


## Installation

### Node.js / Browserify

```bash
npm install ette-proxy --save
```

```javascript
var proxy = require('ette-proxy');

```

### Global object

Include the pre-built script.

```html
<script src="./dist/index.umd.min.js"></script>

```

## Build & test

```bash
npm run build
```

```bash
npm test
```

## Usage

### param

example: https://repl.it/@boycgit/ette-proxy-param

test your router rule: http://forbeslindesay.github.io/express-route-tester/

## document

```bash
npm run doc
```

then open the generated `out/index.html` file in your browser.



注：因中间件机制，当你使用代理组件的时候，应该放在所有路由表应用之前：

正确做法：
```js
   // 需要先挂载代理中间件，否则就错过了
    app.use(proxy(proxyConfig));

    // 然后再挂载路由
    app.use(router.routes());
```

错误做法：
```js
    // 先挂载挂载路由
    app.use(router.routes());

    // 后续挂载的代理功能对上述路由就不适用了
    app.use(proxy(proxyConfig));

```


## License

[MIT](LICENSE).
