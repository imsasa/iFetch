/**
 * @module htp
 * @description This is the main file of the htp module.
 */

import {on as $$on, emit as $$emit} from './utils.js';
import resolveHttpResponse          from './resolve-http-res.js';

function createController(tim) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), tim);
    return controller.signal;
}

/**
 * @private
 * @description 这是一个包含通用方法的对象。
 */
const proto = {
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
    // * The send function.
    // * @method Fetch#link
    // * @see Fetch.link
    // */

}
export  default class Ift {
    static parser = undefined;
    resolver;
    /**
     * @description This is the main class of the request module.
     * @constructor
     * @name Htp
     * @param timeout
     * @param parser
     * @param opts
     */
    constructor({timeout, parser, ...opts} = {}) {
        this.timeout  = timeout || this.constructor.timeout;
        this.resolver = this.resolver || this.constructor.resolver;
    }
}

Object.assign(Ift, proto);
Object.assign(Ift.prototype, proto);