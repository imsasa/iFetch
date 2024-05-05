/**
 * @module req
 * @description This is the main file of the htp module.
 */
/**
 * @file Manages the configuration settings for the widget.
 */

import Interceptor, {tri} from './interceptor.js';
// import {on as $$on, un as $$un, emit as $$emit} from './utils.js';
import parseHttpReq       from './parse-http-req.js'

const REQ_OPTS   = ['method', 'headers', 'mode', 'credentials', 'cache', 'redirect', 'referrer', 'integrity'];

 /**
  * @alias IRequest
  * @inner
  * @private
  * @extends Request
*/
class  IRequest  {
    constructor({url,data,method,headers,...opts}={},{resolver, parser, interceptors}={}){
        headers = headers || new Headers();
        if (headers&&!(headers instanceof Headers)) {
            let headersEntries = Array.isArray(headers) ? headers : Object.entries(headers);
            headers            = new Headers(headersEntries);
        }
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
        this.method = method || "GET";
         /**
         * @property {string|function} url
         * @description ift对象的拦截器属性，可以用于在请求发送前或响应返回后进行一些处理。
         */
        this.url    = typeof url  === 'function' ? url : (v) => v || url;
         /**
         * @property {Object|function} data
         * @description ift对象的拦截器属性，可以用于在请求发送前或响应返回后进行一些处理。
         */
        this.data   = typeof data === 'function' ? data : (v) => v || data;
        Object.assign(this, opts);
        if (resolver) {
            this.resolver = resolver;
        }
        if (parser) {
            this.parser = parser;
        }
        if(!headers){
            headers = new Headers();
        }
        if(!headers.get('Content-Type')){
            switch (method) {
                case "GET":
                    headers.set('Content-Type', 'application/x-www-form-urlencoded');
                    break;
                case "POST":
                    headers.set('Content-Type', 'application/json');
                    break;
            }
        }
         /**
         * @property {Headers} headers
         * @description ift对象的拦截器属性，可以用于在请求发送前或响应返回后进行一些处理。
         */
        this.headers = headers;
    }
    // /**
    //  * @ignore
    //  * @param data
    //  * @param ext
    //  * @return {{data: *, url: *}}
    //  */
    // get(data, ext) {
    //     const ths  = this, dtaFn = this.data, dta = ths.data(data, ext);
    //     this.data  = () => data;
    //     const url  = ths.url();
    //     data       = ths.parser ? ths.parser(data) : data;
    //     let opts = {data: dta, url};
    //     REQ_OPTS.forEach(k => opts[k] = ths[k]);
    //     opts     = tri.apply(this.interceptors.request, [opts, this]);
    //     ths.data  = dtaFn;
    //     return opts;
    // }
    /**
     *
     * @param data
     * @param ext
     * @return {{data: *, url: *}}
     */
    toRequest($data, $ext) {
        let ths  = this, dtaFn = this.data, dta = ths.data($data, $ext);
        this.data  = () => dta;
        const url  = ths.url();
        dta        = ths.parser ? ths.parser(dta,$ext) : dta;
        let opts   = {data: dta, url};
        REQ_OPTS.forEach(k => opts[k] = ths[k]);
        // irequest请求拦截器,参数为配置信息
        [opts]     = tri.apply(this.interceptors.request, [[opts,$ext], ths]);
        ths.data   = dtaFn;
        if(opts.data){
            let type   = opts.headers.get('Content-Type');
            let data   = parseHttpReq(type, opts.data);
            type === 'application/x-www-form-urlencoded' ? opts.url += `?${data}` : opts.body = data;
        }
        Reflect.deleteProperty(opts,'data');
        return opts;
    }

    /**
     *
     * @param data
     * @return {*}
     */
    parser(data) {
        return data;
    }
    /**
     *
     * @param data
     * @return {*}
     */
    resolver(data) {
        return data;
    };
}
/**
 * The complete Triforce, or one or more components of the Triforce.
 * @name module:req.irequest
 * @type {IRequest}
 * 
 */
export const irequest = new IRequest();
/**
 * 
 * 创建一个IRequest对象
 * @function module:req.defineIRequest
 * @param {Object} $opts request配置,同Request
 * @param {Object} $config
 * @returns {IRequest}
 */
export  function defineIRequest($opts, $config= {}) {
    let {resolver, parser, interceptors} = $config;
    if (typeof $opts === 'string') {
        $opts = {url: $opts};
    }
    let {url, method='GET', data, headers, ...opts} = $opts;
    headers ??= new Headers(irequest.headers.entries());
    interceptors = {
        request : [interceptors?.request ].concat(irequest.interceptors.request.get()),
        response: [interceptors?.response].concat(irequest.interceptors.response.get())
    };
    return new IRequest({url, method, data, headers, ...opts},{interceptors, resolver, parser});
}
