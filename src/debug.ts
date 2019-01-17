import Debug from 'debug';

export const debug = Debug('ette-proxy');

// 基本 log 构造函数
// 添加一些基本的注释，方便理解；
export const debugBase = (type: string, ...notes: string[]) => (...props: string[]) => {
    let str = '';
    [].concat(notes as any).forEach(note => {
        str += `[${note}]`;
    });

    props[0] = str + props[0];
    Debug(`ette-proxy:${type}`)(...props);
}

export const debugMini = debugBase('mini', '普通'); // 普通的日志
export const debugObject = debugBase('object', '对象'); // 普通的日志
export const debugError = debugBase('error', '错误'); // 错误日志

// export const debugModel = debugBase('model', '模型'); // 模型的日志
// export const debugComp = debugBase('comp', '组件'); // 组件的日志
// export const debugRender = debugBase('render', '渲染时');  // render 回调中的日志
// export const debugInteract = debugBase('act', '交互行为');  // 交互行为，用户触发的
// export const debugIO = debugBase('io', '数据请求');  // io 请求时的日志
