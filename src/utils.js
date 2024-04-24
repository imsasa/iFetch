/**
 * @module utils
 * @description util set
 */

import Ift from './ift.js';
import Req from './req.js';

const cache4subs = new WeakMap();

/**
 * @param k
 * @param fn
 */
export function on(k,fn,ctx){
    ctx||(ctx = this);
    if(!cache4subs[ctx]){
        cache4subs[ctx] = new Subscribers();
    }
    const sub= cache4subs[ctx];
    sub[k]?.push(fn);
}

/**
 * @param k
 * @param fn
 */
export function off(k,fn){
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
 * @return {void}
 */
export function emit(k,params,ctx){
    let subs = cache4subs[ctx];
    subs [k]?.forEach(fn => fn.apply(ctx, params));
}

/**
 * bind request and htp
 * @param {*} $req
 * @param {*} ifetch
 * @param {*} isSingle
 * @return {Ift}
 */
export function bind($req, ifetch, isSingle) {
    const _ = function (data, info) {
        const req = isSingle !== false ? $req.data(data).toRequest() : $req.toRequest(data);
        return ifetch.send(req, info || data);
    };

    function getter(target, key, receiver) {
        return key === 'send' ? _ : target[key];
    }

    return new Proxy(ifetch, {get: getter});
}

/**
 * The link function.
 * @param {any} vm - The vm parameter.
 * @param {Ift} htp - The ifetch parameter.
 * @return {void}
*/
export function link(vm,htp) {
    htp.on('before', () => vm.loading = true);
    htp.on('complete', () => vm.loading = false);
    htp.on('success', rsp => vm.set && vm.set(rsp));
}

export function toRequest(url, data, opts){
    let ctx  = this;
    let type = opts.headers.get('Content-Type');
    if(ctx?.interceptors){
        for (const interceptor of ctx.interceptors) {
            interceptor.apply(this, [url,data,opts]);
        }
    }
    if(ctx?.parser){
        data = ctx.parser(data);
    }
    data = parseHttpReq(type, data);
    if (contentType === 'application/x-www-form-urlencoded') {
        url += `?${data}`;
        opts = Object.assign({}, this.opts, opts);
    } else {
        opts = Object.assign({}, this.constructor.opts, {body: data},opts);
    }
    return new Request(url, opts);
}


