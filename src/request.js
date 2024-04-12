/**
 * @file request.js
 * @module request
 * @description This is the main file of the request module.
 */
import parseHttpReq from './parse-http-req.js'

function headersOper($headers, flagOverride) {
    if (arguments.length !== 0 && $headers) {
        const headers         = this.opts.headers;
        const $headersEntries = Array.isArray($headers) ? $headers : Object.entries($headers);
        flagOverride !== true ? $headersEntries.forEach(([k, v]) => headers.set(k, v)) : this.opts.headers = new Headers($headersEntries);
        return this;
    } else {
        return this.opts.headers;
    }
}

function toRequest(data, opts={}) {
    try {
        // data = processData(data, this.headers(), this);
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

/**
 * @class
 * @alias Request
 * @description This is the main class of the request module.
 */

class Cls {
    /**
     *
     * @param $data
     * @param $headers
     * @param fetor
     * @param $opts
     */
    constructor($data = {}, {headers: $headers, fetor, ...$opts} = {}) {
        let ths = this;
        Object.defineProperty(this, 'interceptors', {
            value: [], writable: false, enumerable: false, configurable: false
        });
        let url, data = $data;
        /**
         * Gets or sets the URL for the request.
         * @param {*} $url
         * @returns {string|this}
         */
        this.url = $url => $url ? (url = $url, ths) : url;
        let {headers: defaultHeaders, ...defaultOpts} = this.constructor.opts;
        this.opts                                     = Object.assign($opts, defaultOpts);
        this.opts.headers                             = new Headers(defaultHeaders.entries());
        this.headers($headers);
         /**
         * Gets or sets the body data for the request.
         * @param {Object} [$data]
         * @param {*} flagOverride
         * @returns {Object|this}
         */
        this.data = ($data, flagOverride) => {
            if (arguments.length !== 0) {
                flagOverride !== true ? Object.assign(data, $data) : data = $data;
                return this;
            } else {
                return data;
            }
        };
    }

    /**
     * @method
     * @type {function(*, *): (this)}
     */
    headers               = headersOper;
    /**
     * Converts the data to a Request object.
     * @method
     * @param {object} [data] - The data for the request.
     * @returns {Request} - The Request object.
     */
    toRequest;
    /**
     *
     * @param d
     */
    static parser         = d => d;
    static responseParser = d => d;
    static headers        = headersOper;
    /**
     * toRequest是类的表态方法
     *
     **/
    static toRequest      = toRequest;
}


/**
 * Creates a request class.
 * @function
 * @name defineRequest
 * @param {string} $url  - The URL for the request.
 * @param {object} $opts - The options for the request.
 * @returns {Request} - The request class.
 */

export default function defineRequest($url, $opts = {}) {
    const {parser, responseParser, interceptors, fetor, ...opts} = $opts;
    opts.method || (opts.method = 'GET');
    if (!(opts.headers instanceof Headers)) {
        opts.headers = new Headers(Array.isArray(opts.headers) ? opts.headers : Object.entries(opts.headers));
    }
    if (!opts.headers.has('Content-Type')) {
        opts.method === 'GET' ? opts.headers.set('Content-Type', 'application/x-www-form-urlencoded') : opts.headers.set('Content-Type', 'application/json');
    }
    let url = $url;
    class _ extends Cls {
        static opts         = opts;
        static interceptors = interceptors || [];
        url($url) {
            return $url ? (url = $url, this) : url;
        }
        parser              = parser;
    }

    parser && (_.parser = parser);
    responseParser && (_.responseParser = responseParser);
    return _;
};

