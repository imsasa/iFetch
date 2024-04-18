/**
 * @file Manages the configuration settings for the widget.
 */
/**
 * @module module:req
 */
import parseHttpReq from './parse-http-req.js'

/**
 * @ignore
 * @param $url
 * @return {String|Req}
 */
function url($url){
    if($url) REQ_URLS.set(this,$url);
    return $url ? this:REQ_URLS.get(this);
}

/**
 * @ignore
 * @param $data
 * @param overrideFlag
 * @return {data|any}
 */
function data ($data, overrideFlag) {
    let data = REQ_DATA.get(this);
    if (arguments.length !== 0) {
        overrideFlag !== true ? Object.assign(data, $data) : data = $data;
        return this;
    } else {
        return data;
    }
}
/**
 * @method Req#headers
 * @param {*} $headers 
 * @param {Boolean} [flagOverride]
 * @returns {Headers|Req}
 */
function headers($headers, flagOverride) {
    let headersEntries;
    if (arguments.length !== 0 && $headers) {
         headersEntries = Array.isArray($headers) ? $headers : Object.entries($headers);
    } else {
        return this.opts.headers;
    }
    if( flagOverride !== true ){
        let headers = this.opts.headers;
        headersEntries.forEach(([k, v]) => headers.set(k, v));
    }else{
        this.opts.headers = new Headers(headersEntries);
    }
    return this;
}

/**
 * @method Req#toRequest
 * @param {*} data 请求参数数据
 * @param {Object} [opts]  
 * @returns {Request} 
 */
function toRequest(data, opts={}) {
    try {
        if (data === undefined) {
            data = this.body;
        }
        // 应用请求拦截器
        let interceptors = [...this.interceptors, ...this.constructor.interceptors];
        for (const interceptor of interceptors) {
            data = interceptor.apply(this, [data, this.headers(), this]);
        }
        if (this.parser) {
            data = this.parser.call(this, data || this.body);
        }
        data = parseHttpReq(this.headers.get('Content-Type'), data);
    } catch (e) {
         throw new Error(e.message || 'bad request info');
    }
    let url         = this.url() || this.constructor.url;
    let contentType = this.headers().get('Content-Type');
    if (contentType === 'application/x-www-form-urlencoded') {
        url += `?${data}`;
        opts = Object.assign({}, this.constructor.opts, opts);
    } else {
        opts = Object.assign({}, this.constructor.opts, {body: data},opts);
    }
    return new Request(url, opts);
}
function defaultParser(data) {
    return data;
}

const REQ_DATA=new WeakMap();
const REQ_URLS=new WeakMap();
/**
 * @class Req
 * @param $data
 * @param $headers
 * @param fetor
 * @param $opts
 */
class Req {

    constructor($data,{headers: $headers,fetor, ...$opts} = {}) {
        Object.defineProperty(this, 'interceptors', {
            value: [], writable: false, enumerable: false, configurable: false
        });
        REQ_DATA.set(this,$data);
        let {headers: defaultHeaders, ...defaultOpts} = this.constructor.opts;
        this.opts                                     = Object.assign($opts, defaultOpts);
        this.opts.headers                             = new Headers(defaultHeaders.entries());
    }
    /**
     *
     * @param $headers
     * @param flag
     * @return {Headers|Req}
     */
    headers($headers,flag){
        return headers($headers,flag);
    }
    /**
     *
     * @param $data
     * @param overrideFlag
     * @return {data|any}
     */
    data($data, overrideFlag){
           return data.call(this,$data,overrideFlag);
    }
    /**
     * @param {*} [$url]
     * @returns {string|this}
     */
    url($url){
        return url.call(this,$url)||this.constructor.url();
    }
    /**
     *
     * @param data
     * @param opts
     * @return {Request}
     */
    toRequest(data, opts={}){
        return toRequest.call(this,data,opts);
    };

    /**
     *
     * @param data
     * @return {*}
     */
    parser(data){
        return  defaultParser(data);
    }

    /**
     *
     * @param data
     * @return {*}
     */
    responseParser(data){
        return defaultParser(data);
    }
    /**
     *@ignore
     *@param {*} data
     */
    static parser(data){
        return  defaultParser(data);
    }
    /**
     * @ignore
     * @param {*} data 请求返回的结果 
     */
    static  responseParser(data){
        return defaultParser(data);
    }

    /**
     * @ignore
     * @param $headers
     * @param flagOverride
     * @return {Headers|Req}
     */
    static headers ($headers, flagOverride){
        return headers.call(this,$headers, flagOverride);
    }

    /**
     *
     * @ignore
     * @param data
     * @param opts
     * @return {Request}
     */
    static  toRequest(data, opts={}){
        return toRequest.call(this,data,opts);
    };
    /**
     * @param {*} [$url]
     * @returns {string|this}
     */
    static url($url){
        return url.call(this,$url);
    }
}
export default Req;


/**
 * Creates a request class.
 * @param {string} $url  - The URL for the request.
 * @param {object} $opts - The options for the request.
 * @return {Req} - The request class.
 */
export function defineRequest($url, $opts = {}) {
    let {parser, responseParser, interceptors, fetor, ...opts} = $opts;
    opts.method || (opts.method = 'GET');
    if (!(opts.headers instanceof Headers)) {
        opts.headers = new Headers(Array.isArray(opts.headers) ? opts.headers : Object.entries(opts.headers));
    }
    if (!opts.headers.has('Content-Type')) {
        opts.method === 'GET' ? opts.headers.set('Content-Type', 'application/x-www-form-urlencoded') : opts.headers.set('Content-Type', 'application/json');
    }

    class _ extends Req {
        static opts         = opts;
        static interceptors = interceptors || [];
        parser              = parser;
    }
    REQ_URLS.set(_,$url);
    if(!parser){
        _.parser = parser;
    }
    if(!responseParser){
        _.responseParser = responseParser;
    }
    return _;
}