/**
 * @file Manages the configuration settings for the widget.
 */
/**
 * @module module:req
 */

import {toRequest} from './utils.js';

const REQS = new WeakMap();

export const req = {
    opts: {},
    /**
     *
     * @param  {Headers|Object} [$headers]
     * @param  {Boolean} [$override = false]
     * @return {Headers}
     */
    headers: function ($headers, $override) {
        let headersEntries, headers;
        let opts = REQS.get(this);
        if (arguments.length === 0) {
            return opts.headers;
        }
        if ($headers && $headers instanceof Headers) {
            headers = $headers;
        } else {
            $headers       = {};
            headersEntries = Array.isArray($headers) ? $headers : Object.entries($headers);
            headers        = new Headers(headersEntries);
        }
        if ($override !== true) {
            headers.forEach((k, v) => opts.headers.set(k, v));
        } else {
            opts.headers = headers;
        }
        return opts.headers;
    },

    /**
     *
     * @param $data
     * @param $override
     * @return {data|any}
     */
    data: function ($data, $override) {
        let opts = REQS.get(this);
        if (arguments.length !== 0) {
            $override !== true ? Object.assign(opts.data, $data) : opts.data = $data;
        }
        return opts.data;
    },

    /**
     * @method req#toRequest
     * @param {*} data 请求参数数据
     * @param {Object} [opts]
     * @returns {Request}
     */


    toRequest(data) {
        let opts = REQS.get(this);
        let url  = this.url();
        data     = data ? this.data(data) : this.data();
        return toRequest.apply(this, [url, data, opts]);
    },

    /**
     *
     * @param data
     * @return {*}
     */
    parser(data) {
        return data;
    },

    /**
     *
     * @param data
     * @return {*}
     */
    resolver(data) {
        return data;
    },
    /**
     * @ignore
     * @param {String} [$url]
     * @return {String}
     */
    url: function ($url) {
        if ($url) REQS.set(this, $url);
        return REQS.get(this).url;
    },
    method(v) {
        let opts = REQS.get(this);
        return v ? opts['method'] = v : opts['method'];
    },
    interceptors: []
}


function overrideReqProp(v, prop, obj) {
    if (typeof v === 'function') {
        const fn  = v;
        const _   = obj[prop];
        obj[prop] = function (v, opts) {
            v              = fn.apply(this, [v, opts]);
            obj.opts[prop] = _.apply(this, v.apply(this, [v, opts]));
        };
    } else if (v !== undefined) {
        obj.opts[prop] = v;
    }
}


/**
 *
 */
export default function defineRequest($opts, $config = {}) {
    let _req = Object.create(req);
    if (typeof $opts === 'string') {
        $opts = {url: $opts};
    }
    let {url, method = "GET", data, headers, ...opts} = $opts;
    let {parser, resolver, interceptors = []}         = $config;
    REQS.set(_req, opts);
    Object.defineProperty(_req, 'opts', {get: () => REQS.get(_req)});
    _req.interceptors = [...interceptors, ...req.interceptors];
    headers           = _req.headers(headers, true);
    if (!_req.headers().get('Content-Type')) {
        switch (method) {
            case "GET":
                headers.set('Content-Type', 'application/x-www-form-urlencoded');
                break;
            case "POST":
                headers.set('Content-Type', 'application/json');
                break;
        }
    }
    opts.data = {};
    _req.method(method);
    overrideReqProp(data, 'data', _req); // ($url, 'url', _req)(resolver,'resolver',_req)(parser,'parser',_req);
    overrideReqProp(url, 'url', _req);
    overrideReqProp(resolver, 'resolver', _req);
    overrideReqProp(parser, 'parser', _req);
    return _req;
}
