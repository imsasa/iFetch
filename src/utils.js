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
export function on(k,fn){
    if(!cache4subs[this]){
        cache4subs[this] = new Subscribers();
    }
    const sub= cache4subs[this];
    sub[k]?.push(fn);
}

/**
 * @param k
 * @param fn
 */
export function off(k,fn){
    let subs    = cache4subs[this];
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
export function emit(k,params){
    let subs = cache4subs[this];
    subs [k]?.forEach(fn => fn.apply(this, params));
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
/**
 * 全局方法，全来创建一个Htp类
 * @param resolver
 * @param timeout
 * @param {Object} opts
 * @return {Ift}
 */
export  function defineIFetch({resolver, timeout, ...opts} = {}) {
    class _ extends Ift {
        constructor(opts = {}) {
            super(opts);
        }

        static timeout  = timeout;
        static resolver = resolver;
    }

    return _;
}



