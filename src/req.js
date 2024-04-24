/**
 * @file Manages the configuration settings for the widget.
 */
/**
 * @module module:req
 */

import { toRequest } from './utils.js';
const REQS = new WeakMap();

export let  req = {
    opts:{ },
    /**
     *
     * @param  {Headers|Object}$headers
     * @param  {Boolean} [$override = false]
     * @return {Headers}
     */
    headers: function( $headers, $override ){
        let headersEntries;
        let opts = REQS.get(this);
        if (arguments.length === 0) {
            return opts.headers;
        }
        if (arguments.length !== 0 && $headers) {
             headersEntries = Array.isArray($headers) ? $headers : Object.entries($headers);
        }
        if( $override !== true ){
            let headers = opts.headers;
            headersEntries.forEach(([k, v]) => headers.set(k, v));
        }else{
            opts.headers = new Headers(headersEntries);
        }
        return this;
    },

    /**
     *
     * @param $data
     * @param $override
     * @return {data|any}
     */
    data: function  ($data, $override) {
        let opts = REQS.get(this);
        if (arguments.length !== 0) {
            $override !== true ? Object.assign(opts.data, $data) : opts.data = $data;
        } 
        return opts.data;
    },
  
    /**
     * @method Req#toRequest
     * @param {*} data 请求参数数据
     * @param {Object} [opts]  
     * @returns {Request} 
     */


    toRequest(data) {
        let opts  = REQS.get(this);
        url  = this.url();
        data = this.data(data);
        return toRequest.apply(this,[url,data,opts]);
    },

    /**
     *
     * @param data
     * @return {*}
     */
    parser(data){
        return data;
    },

    /**
     *
     * @param data
     * @return {*}
     */
    resolver(data){
        return data;
    },
    /**
     * @ignore
     * @param $url
     * @return {String|Req}
     */
    url: function($url){
        if($url) REQ_URLS.set(this,$url);
        return $url ? this:REQ_URLS.get(this);
    },
    method(v){
        let opts = REQS.get(this);
        return v?opts['method']=v:opts['method'];
    },
    interceptors:[]
}



function overrideReqProp(v,prop,obj){
    if(typeof v === 'function'){   
        let fn = v;
        let _  = req.url;
        obj[prop] = function($url){
            let v = fn.apply(this, [$url]);
            obj.opts.url = _.call(this,v.apply(this,[$url]));
        };
    }else if(v !== undefined){
        obj.opts[prop] = v;
    }
}


/**
 * 
 */
export function defineRequest($opts,$config = {}) {
    let _req  = Object.create(req);
    if(typeof $opts ==='string'){
        $opts={url:$opts};
    }
    const {url,method, data, headers,...opts} = $opts;
    const {parser,resolver,interceptors}      = $config;
    REQS.set(_req, opts);
    Object.defineProperty(_req,'opts',{get:()=>REQS.get(_req)});
    _req.interceptors = [...interceptors, ...req.interceptors];
    _req.headers(headers);
    overrideReqProp(data, 'data', _req); // ($url, 'url', _req)(resolver,'resolver',_req)(parser,'parser',_req);
    overrideReqProp(url, 'url', _req);
    overrideReqProp(resolver, 'resolver', _req);
    overrideReqProp(parser, 'parser', _req);
    return _req;
}
