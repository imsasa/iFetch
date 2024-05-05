/**
 * @module utils
 * @ignore
 * @description util set
 */
import parseHttpReq from "./parse-http-req.js";

const cache4subs = new WeakMap();

/**
 * @param k
 * @param fn
 * @param ctx
 */
export function on(k, fn, ctx) {
    ctx || (ctx = this);
    if (!cache4subs[ctx]) {
        cache4subs[ctx] = {};
    }
    const sub = cache4subs[ctx];
    sub[k] || (sub[k] = []);
    sub[k].push(fn);
}

/**
 * @param k
 * @param fn
 * @param ctx
 */
export function un(k, fn, ctx) {
    ctx || (ctx = this);
    let subs    = cache4subs[ctx];
    const index = subs [k]?.indexOf(fn);
    if (index > -1) {
        subs [k].splice(index, 1);
    }
}

/**
 * @param {string} k
 * @param {*} params
 * @param ctx
 * @return {void}
 */
export function emit(k, params, ctx) {
    let subs = cache4subs[ctx];
    if(subs && subs[k]){
        subs[k].forEach(fn => fn.apply(ctx, params));
    }
}

/**
 * The link function.
 * @param {any} vm - The vm parameter.
 * @param {ift} htp - The ifetch parameter.
 * @return {void}
 */
export function link(vm, htp) {
    htp.on('before', () => vm.loading = true);
    htp.on('complete', () => vm.loading = false);
    htp.on('success', rsp => vm.set && vm.set(rsp));
}
// method: 请求的方法，例如：GET, POST。
// headers: 任何你想加到请求中的头，其被放在Headers对象或内部值为ByteString 的对象字面量中。
// body: 任何你想加到请求中的 body，可以是Blob, BufferSource, FormData, URLSearchParams, USVString，或ReadableStream对象。注意GET 和 HEAD 请求没有 body。
// mode: 请求的模式，比如 cors, no-cors, same-origin, 或 navigate。默认值为 cors。
// credentials: 想要在请求中使用的 credentials：: omit, same-origin, 或 include。默认值应该为omit。但在 Chrome 中，Chrome 47 之前的版本默认值为 same-origin ，自 Chrome 47 起，默认值为 include。
// cache: 请求中想要使用的 cache mode
// redirect: 对重定向处理的模式： follow, error, or manual。在 Chrome 中，Chrome 47 之前的版本默认值为 manual，自 Chrome 47 起，默认值为 follow。
// referrer: 一个指定了no-referrer, client, 或一个 URL 的 USVString 。默认值是about:client。
// integrity: 包括请求的 subresource integrity 值 (e.g., sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=).



