/**
 * @file ift.js
 * @module module:ift
 * @description 该模块提供了一些用于网络请求的方法和对象。
 */

import {on as $$on, un as $$un, emit as $$emit} from './utils.js';
import resolveHttpResponse                      from './resolve-http-res.js';
import Interceptor,{tri}                        from './interceptor.js';

/**
 * @private
 * @ignore
 * @param {*} tim 超时时间 
 */

function createController(tim) {
    if (tim === undefined) return;
    const controller = new AbortController();
    setTimeout(() => controller.abort(), tim);
    return controller.signal;
}

function toRequest($req, $data, $ext) {
    if(!$req)  return;
    // ifetch请求拦截器
    let [data, ext] = tri.apply(this.interceptors.request, [[$data, $ext], this]);
    return $req.toRequest(data,ext);
}


async function send($req, $ext){
    let req = $req,ths = this, ret;
    if (!req || typeof req ==='string') {
        ret = {code: 400, message: req||"请求错误"};
        $$emit('fail', [ret, req, $ext], ths);
        return ret;
    }
    $$emit('start', [{req, ext: $ext}], ths);
    if(!($req instanceof Request)){
        $ext??= req;
        req = new Request(req.url,req);
    }
    let opt = {
        signal: createController(ths.timeout)
    };
    ret        = await fetch(req, opt).then(async (rsp) => {
        /**
         * 基础解析，解析http请求的返回结果
         */
        let ret = await resolveHttpResponse(rsp, ths);
        /**
         * 针对接口的数据解析，如果在请求对象中定义了responseResolver，则使用请求对象中的responseResolver
         */
        if (ths.req.resolver) {
            ret = await ths.req.resolver(ret, $ext);
        }
        if(ths.req.interceptors?.response){
            // 
            [ret] = tri.apply(ths.req.interceptors.response, [[ret, $ext], ths]);
        }
        /**
         * 针对具体请求操作的解析
         */
        if (ths.resolver) {
            ret = await ths.resolver(ret, $ext);
        }
        // ifetch返回拦截器
        [ret]=tri.apply(ths.interceptors.response, [[ret, $ext], ths])
        $$emit('success', [ret, req, $ext], ths);
        return ret;
    }).catch(e => {
        $$emit('fail', [{code: '0000', message: e.message}, req, $ext], ths);
        return ret;
    });
    $$emit('complete', [ret, req, $ext], ths);
    return ret;
}
 /**
  * @alias IFetch
  * @inner
  * @private
*/
class IFetch {
    constructor({interceptors,timeout,resolver}={}) {
        /**
        * @property {Object} interceptors
        * @property {Interceptor} interceptors.request
        * @property {Interceptor} interceptors.response
        * @description ift对象的拦截器属性，可以用于在请求发送前或响应返回后进行一些处理。
        */
        this.interceptors = {
            request:  new Interceptor(interceptors?.request),
            response: new Interceptor(interceptors?.response)
        };
        if (timeout!==undefined) {
            this.timeout = timeout;
        }
        if (typeof resolver === 'function') {
            this.resolver = resolver;
        }
      }
    /**
     * @method 
     * @description 注册一个事件处理器
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理器
     */
    on  = $$on;
   /**
     * @method
     * @description 移除一个事件处理器
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理器
     */
    un  = $$un;
    /**
     * @method 
     * @description 绑定一个事件处理器
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理器
     */
    bind= function ($req) {
        return new Proxy(this,
            {
                get: function (target, key, receiver) {
                    return key === 'req'?$req:Reflect.get(target, key, receiver);
                }
            });
    };
   /**
    * @method
    * @description 发送一个POST请求
    * @param {string} url - 请求的URL
     * @param {Object} data - 请求的数据
     * @returns {Promise} 返回一个Promise对象
     */
    post = function($data, $ext){
        let $opts    = toRequest.apply(this.req, [this.req, $data, $ext]);
        if($opts){
            $opts.method = 'POST';
        }
        return send.apply(this,[$opts, $ext]);
    };
   /**
     * @method 
     * @description 发送一个GET请求
     * @param {string} url - 请求的URL
     * @param {Object} params - 请求的参数
     * @returns {Promise} 返回一个Promise对象
     */
    get = function($data, $ext){
        let $opts    = toRequest.apply(this,[this.req,$data, $ext]);
        if($opts){
            $opts.method = 'POST';
        }
        return send.apply(this,[$opts, $ext]);
    };
   /**
     * @method
     * @description 发送一个请求
     * @param {string} method - 请求的方法
     * @param {string} url - 请求的URL
     * @param {Object} data - 请求的数据
     * @returns {Promise} 返回一个Promise对象
     */
    send = function($data, $ext){
        let $opts = toRequest.apply(this, [this.req, $data, $ext]);
        return send.apply(this,[$opts, $ext]);
    }
}


/**
 * The complete Triforce, or one or more components of the Triforce.
 * @name module:ift.ifetch
 * @type {IFetch}
 * 
 */
export const ifetch= new IFetch();
/**
 * @function module:ift.defineIFetch
 * @description 定义一个IFetch方法
 * @param {Object} options - 配置选项
 * @returns {IFetch} 
 */
export function defineIFetch({resolver, timeout, interceptors={}} = {}) {
    let its = ifetch.interceptors;
    const _ = new IFetch({
        resolver,timeout,
        interceptors:{
            request:[interceptors.request].concat(its.request.get()),
           response:[interceptors.response].concat(its.response.get())
       }
    });
    return _;
}