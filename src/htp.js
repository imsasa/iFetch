/**
 * @file htp.js
 * @module htp
 * @description This is the main file of the htp module.
 */

import {on as $$on, emit as $$emit} from './sub.js';
import resolveHttpResponse          from './resolve-http-res.js';

function createController(tim) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), tim);
    return controller.signal;
}



function bindReq($req, isSingle) {
    let ths = this;
    const _ = function (data, info) {
        const req = isSingle !== false ? $req.data(data).toRequest() : $req.toRequest(data);
        return ths.send(req, info || data);
    };

    function getter(target, key, receiver) {
        return key === 'send' ? _ : target[key];
    }

    return new Proxy(ths, {get: getter});
}

/**
 * @private
 * @description 这是一个包含通用方法的对象。
 */
const proto = {
    /**
     * @method Fetch#on
     * @see module:sub.on
     */
    /**
     * @method Fetch.on
     * @see module:sub.on
     */
    on: $$on,

    /**
    * The send function.
    * @method Fetch.send
    * @param $req
    * @param info
    * @return {Promise<{code: number, message}|*>}
    */
   /**
    * The send function.
    * @method Fetch#send
    * @see Fetch#send
    */
    send: async function ($req, info) {
       let ths = this, opt = {}, ret;
       let req = req.toRequest ? $req.toRequest() : $req;
       if (!req) {
           let info = {code: 400, message: e.message};
           Reflect.apply($$emit, ths, ['fail', info]);
           return info;
       }
       info = info === undefined ? $req : info;
       Reflect.apply($$emit, ths, ['start', [req, info, ths]]);
       if(this.timeout){
            opt.signal = createController(this.timeout)
       }
       ret = await fetch(req, opt).then(async (rsp) => {
           /**
            * 基础解析，解析http请求的返回结果
            */
           let ret = await resolveHttpResponse(rsp, ths);
           /**
            * 针对接口的数据解析，如果在请求对象中定义了responseResolver，则使用请求对象中的responseResolver
            */
           if ($req.resolver) {
               ret = await $req.resolver.apply($req, [ret, info]);
           }
           /**
            * 针对具体请求操作的解析
            */
           if (ths.resolver) {
               ret = await ths.resolver.apply(this, [ret, info, req]);
           }
           Reflect.apply($$emit, ths, ['success', [req, info, ths]]);
           return ret;
       }).catch(e => {
           Reflect.apply($$emit, ths, ['fail', [{code: '0000', message: e.message}, info, this, req]]);
           return ret;
       });
       Reflect.apply($$emit, ths, ['complete', [ret, info, this, req]]);
       return ret;
   }
   ,

    /**
     * The get function.
     * @function Fetch.get
     * @param {any} data - The data parameter.
     * @returns {any} The result of the send function with method 'GET'.
     */
    /**
    * The send function.
    * @method Fetch#get
    * @see Fetch.get
    */
    get: function (data) {
        return this.send(data, {method: 'GET'});
    },

    /**
     * The post function.
     * @function Fetch.post
     * @param {any} data - The data parameter.
     * @returns {any} The result of the send function with method 'POST'.
     */
    /**
    * The send function.
    * @method Fetch#post
    * @see Fetch.post
    */
    post: function (data) {
        return this.send(data, {method: 'POST'});
    },

    // /**
    //  * The bindReq function.
    //  * @function Fetch.bindReq
    //  * @type {Function}
    //  */
    // /**
    // * The send function.
    // * @method Fetch#bindReq
    // * @see Fetch.bindReq
    // */

    // /**
    //  * The link function.
    //  * @function Fetch.link
    //  * @param {any} $vm - The $vm parameter.
    //  * @returns {this} The updated Proto object.
    //  */
    // /**
    // * The send function.
    // * @method Fetch#link
    // * @see Fetch.link
    // */
    // link($vm) {
    //     this.on('before', () => $vm.loading = true);
    //     this.on('complete', () => $vm.loading = false);
    //     this.on('success', rsp => $vm.set && $vm.set(rsp));
    //     return this;
    // }
}

/**
 * @class
 * @alias Fetch
 * @description This is the main class of the request module.
 */
class DefaultFetch {
    static parser = undefined;
    resolver;

    /**
     *
     * @param timeout
     * @param parser
     * @param opts
     */
    constructor({timeout, parser, ...opts} = {}) {
        this.timeout  = timeout || this.constructor.timeout;
        this.resolver = this.resolver || this.constructor.resolver;
    }
}

Object.assign(DefaultFetch, proto);
Object.assign(DefaultFetch.prototype, proto);
/**
 * 全局方法，全来创建一个Fetch类
 * @function
 * @name defineFetch
 * @param resolver
 * @param timeout
 * @param {Object} opts
 * @returns {Fetch}
 */
export default function defineFetch({resolver, timeout, ...opts} = {}) {
    class _ extends DefaultFetch {
        constructor(opts = {}) {
            super(opts);
        }

        static timeout  = timeout;
        static resolver = resolver;
    }

    return _;
};
