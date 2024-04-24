/**
 * @module htp
 * @description This is the main file of the htp module.
 */

import {on as $$on, emit as $$emit, toRequest as $$toRequest, toRequest} from './utils.js';
import resolveHttpResponse                                               from './resolve-http-res.js';
import {req}                                                             from "./req";

function createController(tim) {
    if (tim === undefined) return;
    const controller = new AbortController();
    setTimeout(() => controller.abort(), tim);
    return controller.signal;
}

/**
 * @private
 * @description 这是一个包含通用方法的对象。
 */
export const ift = {
    /**
     * @method ift#on
     * @see module:sub.on
     */
    /**
     * @method ift.on
     * @see module:sub.on
     */
    on  : $$on,
    bind: function ($req, isSingle) {
        let ift = this;
        const _ = function ($data, ext) {
            let req = isSingle !== fasle ? $req.toRequest($data) : $$toRequest.apply($req, [$req.url(), $data, $req.opts]);
            return ift.send(req, ext);
        };

        function getter(target, key, receiver) {
            return key === 'send' ? _ : target[key];
        }

        return new Proxy(ift, {get: getter});
    },

    /**
     * send function.
     * @param $req
     * @param {*} [$ext]
     * @return {Promise<{code: number, message}|*>}
     */
    send: async function ($req, $ext) {
        let ths = this, opt = {},req,ret;
        let interceptors = ths.interceptors;
        for(let interceptor of interceptors){
            $req = interceptors($req,$ext);
        }
        if($req){
            req = $req.toRequest ? $req.toRequest() : $req;
        }
        if (!req) {
            ret = {code: 400, message: e.message};
            $$emit('fail', [ret, req, $ext], ths);
            return ret;
        }
        if ($ext === undefined) {
            $ext = $req;
        }
        $$emit('start', [{req, ext: $ext}], ths);
        opt.signal = createController(ths.timeout);
        ret        = await fetch(req, opt).then(async (rsp) => {
            /**
             * 基础解析，解析http请求的返回结果
             */
            let ret = await resolveHttpResponse(rsp, ths);
            /**
             * 针对接口的数据解析，如果在请求对象中定义了responseResolver，则使用请求对象中的responseResolver
             */
            if ($req.resolver) {
                ret = await $req.resolver(ret, $ext);
            }
            /**
             * 针对具体请求操作的解析
             */
            if (ths.resolver) {
                ret = await ths.resolver(ret, $ext);
            }
            $$emit('success', [ret, req, $ext], ths);
            return ret;
        }).catch(e => {
            $$emit('fail', [{code: '0000', message: e.message}, req, $ext], ths);
            return ret;
        });
        $$emit('complete', [ret, req, $ext], ths);
        return ret;
    },

    /**
     * The get function.
     * @function ift.get
     * @param {any} data - The data parameter.
     * @returns {any} The result of the send function with method 'GET'.
     */
    /**
     * The get .
     * @method ift#get
     * @see Ift.get
     */
    get: function (req) {
        req.method('GET');
        return this.send(req);
    },

    /**
     * The post function.
     * @function ift.post
     * @param {any} data - The data parameter.
     * @returns {any} The result of the send function with method 'POST'.
     */
    /**
     * The send function.
     * @method ift#post
     * @see Ift.post
     */
    post: function (req) {
        req.method('POST');
        return this.send(req);
    },
    interceptors: []
}

/**
 * @description This is the main class of the request module.
 * @class
 * @param timeout
 * @param parser
 * @param opts
 */

export default function defineIFetch({resolver, timeout,    interceptors=[], ...opts} = {}) {
    let _ = Object.create(ift);
    _.interceptors = [...interceptors, ...req.interceptors];
    if (timeout) {
        _.timeout = timeout;
    }
    if (resolver) {
        _.resolver = resolver;
    }
    return _;
}