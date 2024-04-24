/**
 * @module utils
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
export function off(k, fn, ctx) {
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

export function toRequest(url, data, opts) {
    let ctx  = this;
    let type = opts.headers.get('Content-Type');
    if (ctx?.interceptors) {
        for (const interceptor of ctx.interceptors) {
            interceptor.apply(this, [url, data, opts]);
        }
    }
    if (ctx?.parser) {
        data = ctx.parser(data);
    }
    data =  parseHttpReq(type, data);
    if (type === 'application/x-www-form-urlencoded') {
        url += `?${data}`;
        opts = Object.assign({}, this.opts, opts);
    } else {
        opts = Object.assign({}, this.constructor.opts, {body: data}, opts);
    }
    return new Request(url, opts);
}


