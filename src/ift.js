/**
 * @module htp
 * @description This is the main file of the htp module.
 */

import {on as $$on, emit as $$emit,toRequest as $$toRequest, toRequest} from './utils.js';
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
    bind: function ($req,  isSingle) {
        let ifetch = this;
        const _ = function ($data, ext) {
            let req = isSingle!==fasle?$req.toRequest($data): $$toRequest.apply($req,[$req.url(),$data,$req.opts]);
            return ifetch.send(req, ext);
        };

        function getter(target, key, receiver) {
            return key === 'send' ? _ : target[key];
        }
    
        return new Proxy(ifetch, {get: getter});
    },
    
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
    send: async function ($req, $ext) {
       let ths = this, opt = {};
       let req = req.toRequest ? $req.toRequest() : $req;
       let ret ;
       if (!req) {
           ret = {code: 400, message: e.message};
           $$emit('fail',[ret,req,$ext],ths);
           return ret;
       }
       info = info === undefined ? $req : info;
       $$emit('start',[{req, ext:$ext}], ths);
       opt.signal = createController(ths.timeout);
       ret = await fetch(req, opt).then(async (rsp) => {
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
           $$emit('fail',[{code: '0000', message: e.message}, req, $ext], ths);
           return ret;
       });
       $$emit('complete',[ret, req, $ext], ths);
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
        return this.send(req);
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
        return this.send(req);
    },
}

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