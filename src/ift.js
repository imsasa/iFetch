/**
 * @module htp
 * @description This is the main file of the htp module.
 */

import {on as $$on, emit as $$emit} from './utils.js';
import resolveHttpResponse          from './resolve-http-res.js';

function createController(tim) {
    if(tim === undefined)return;
    const controller = new AbortController();
    setTimeout(() => controller.abort(), tim);
    return controller.signal;
}

/**
 * @private
 * @description 这是一个包含通用方法的对象。
 */
const Ift = {
    /**
     * @method Ift#on
     * @see module:sub.on
     */
    /**
     * @method Ift.on
     * @see module:sub.on
     */
    on: $$on,

    /**
    * The send function.
    * @method Ift.send
    * @param $req
    * @param info
    * @return {Promise<{code: number, message}|*>}
    */
   /**
    * The send function.
    * @method Ift#send
    * @see Ift#send
    */
    send: async function ($req, info) {
       let ths = this, opt = {}, ret;
       let req = req.toRequest ? $req.toRequest() : $req;
       if (!req) {
           let info = {code: 400, message: e.message};
           Reflect.apply($$emit, ths, ['fail', [info,$req]]);
           return info;
       }
       info = info === undefined ? $req : info;
       Reflect.apply($$emit, ths, ['start', [req, info, ths]]);
       opt.signal = createController(this.timeout)
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
   },

    /**
     * The get function.
     * @function Ift.get
     * @param {any} data - The data parameter.
     * @returns {any} The result of the send function with method 'GET'.
     */
    /**
    * The get .
    * @method Ift#get
    * @see Ift.get
    */
    get: function (req) {
        return this.send(req, {method: 'GET'});
    },

    /**
     * The post function.
     * @function Ift.post
     * @param {any} data - The data parameter.
     * @returns {any} The result of the send function with method 'POST'.
     */
    /**
    * The send function.
    * @method Ift#post
    * @see Ift.post
    */
    post: function (req) {
        return this.send(req, {method: 'POST'});
    },
}

// export  default class Ift {
//     static parser = undefined;
//     resolver;
//     constructor({timeout, parser, ...opts} = {}) {
//         this.timeout  = timeout || this.constructor.timeout;
//         this.resolver = this.resolver || this.constructor.resolver;
//     }
// }

// Object.assign(Ift, proto);
// Object.assign(Ift.prototype, proto);
// /**
//  * 全局方法，全来创建一个Htp类
//  * @param resolver
//  * @param timeout
//  * @param {Object} opts
//  * @return {Ift}
//  */
// export  function defineIFetch({resolver, timeout, ...opts} = {}) {
//     class _ extends Ift {
//         constructor(opts = {}) {
//             super(opts);
//         }

//         static timeout  = timeout;
//         static resolver = resolver;
//     }

//     return _;
// }

/**
 * @description This is the main class of the request module.
 * @class
 * @param timeout
 * @param parser
 * @param opts
 */

export default function defineIFetch({resolver, timeout, ...opts} = {}) {
    let ift = Object.create(Ift);
    if(timeout){
        ift.timeout = timeout;
    }
    if(resolver){
        ift.resolver = resolver;
    }
    return ift;
}