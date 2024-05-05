/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./example/index.js":
/*!**************************!*\
  !*** ./example/index.js ***!
  \**************************/
/***/ ((__webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(__webpack_module__, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _src_req_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../src/req.js */ \"./src/req.js\");\n/* harmony import */ var _src_ift_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../src/ift.js */ \"./src/ift.js\");\n\n\nlet req = (0,_src_req_js__WEBPACK_IMPORTED_MODULE_0__.defineRequest)('http://myip.ipip.net/s');\nlet ift = (0,_src_ift_js__WEBPACK_IMPORTED_MODULE_1__.defineIFetch)().bind(req);\nift.interceptors.request.use(function ($data,$ext){\n    console.log($data);\n    return ['aaa','bbb'];\n});\nift.interceptors.request.use(function ($data,$ext){\n    console.log($data);\n    console.log($ext);\n    return ['ccc','bbb'];\n});\nlet res = await ift.send(123,456);\nconsole.log(res);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } }, 1);\n\n//# sourceURL=webpack://iFetch/./example/index.js?");

/***/ }),

/***/ "./src/ift.js":
/*!********************!*\
  !*** ./src/ift.js ***!
  \********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   defineIFetch: () => (/* binding */ defineIFetch),\n/* harmony export */   ifetch: () => (/* binding */ ifetch)\n/* harmony export */ });\n/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ \"./src/utils.js\");\n/* harmony import */ var _resolve_http_res_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resolve-http-res.js */ \"./src/resolve-http-res.js\");\n/* harmony import */ var _interceptor_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./interceptor.js */ \"./src/interceptor.js\");\n/**\n * @file ift.js\n * @module module:ift\n * @description 该模块提供了一些用于网络请求的方法和对象。\n */\n\n\n\n\n\n/**\n * @private\n * @ignore\n * @param {*} tim 超时时间 \n */\n\nfunction createController(tim) {\n    if (tim === undefined) return;\n    const controller = new AbortController();\n    setTimeout(() => controller.abort(), tim);\n    return controller.signal;\n}\n\nfunction toRequest($req, $data, $ext) {\n    if(!$req)  return;\n    // ifetch请求拦截器\n    let [data, ext] = _interceptor_js__WEBPACK_IMPORTED_MODULE_2__.tri.apply(this.interceptors.request, [[$data, $ext], this]);\n    return $req.toRequest(data,ext);\n}\n\n\nasync function send($req, $ext){\n    let req = $req,ths = this, ret;\n    if (!req || typeof req ==='string') {\n        ret = {code: 400, message: req||\"请求错误\"};\n        (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.emit)('fail', [ret, req, $ext], ths);\n        return ret;\n    }\n    (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.emit)('start', [{req, ext: $ext}], ths);\n    if(!($req instanceof Request)){\n        $ext??= req;\n        req = new Request(req.url,req);\n    }\n    let opt = {\n        signal: createController(ths.timeout)\n    };\n    ret        = await fetch(req, opt).then(async (rsp) => {\n        /**\n         * 基础解析，解析http请求的返回结果\n         */\n        let ret = await (0,_resolve_http_res_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(rsp, ths);\n        /**\n         * 针对接口的数据解析，如果在请求对象中定义了responseResolver，则使用请求对象中的responseResolver\n         */\n        if ($req.resolver) {j\n            ret = await $req.resolver(ret, $ext);\n        }\n        if(ths.req.interceptors?.response){\n            // \n            ret = _interceptor_js__WEBPACK_IMPORTED_MODULE_2__.tri.apply(ths.req.interceptors.response, [[ret, $ext], ths]);\n        }\n        /**\n         * 针对具体请求操作的解析\n         */\n        if (ths.resolver) {\n            ret = await ths.resolver(ret, $ext);\n        }\n        // ifetch返回拦截器\n        _interceptor_js__WEBPACK_IMPORTED_MODULE_2__.tri.apply(ths.interceptors.response, [[ret, $ext], ths])\n        ;(0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.emit)('success', [ret, req, $ext], ths);\n        return ret;\n    }).catch(e => {\n        (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.emit)('fail', [{code: '0000', message: e.message}, req, $ext], ths);\n        return ret;\n    });\n    (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.emit)('complete', [ret, req, $ext], ths);\n    return ret;\n}\n /**\n  * @alias IFetch\n  * @inner\n  * @private\n*/\nclass IFetch {\n    constructor({interceptors,timeout,resolver}={}) {\n        /**\n        * @property {Object} interceptors\n        * @property {Interceptor} interceptors.request\n        * @property {Interceptor} interceptors.response\n        * @description ift对象的拦截器属性，可以用于在请求发送前或响应返回后进行一些处理。\n        */\n        this.interceptors = {\n            request:  new _interceptor_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"](interceptors?.request),\n            response: new _interceptor_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"](interceptors?.response)\n        };\n        if (timeout!==undefined) {\n            _.timeout = timeout;\n        }\n        if (typeof resolver === 'function') {\n            _.resolver = resolver;\n        }\n      }\n    /**\n     * @method \n     * @description 注册一个事件处理器\n     * @param {string} event - 事件名称\n     * @param {Function} handler - 事件处理器\n     */\n    on  = _utils_js__WEBPACK_IMPORTED_MODULE_0__.on;\n   /**\n     * @method\n     * @description 移除一个事件处理器\n     * @param {string} event - 事件名称\n     * @param {Function} handler - 事件处理器\n     */\n    un  = _utils_js__WEBPACK_IMPORTED_MODULE_0__.un;\n    /**\n     * @method \n     * @description 绑定一个事件处理器\n     * @param {string} event - 事件名称\n     * @param {Function} handler - 事件处理器\n     */\n    bind= function ($req) {\n        return new Proxy(this,\n            {\n                get: function (target, key, receiver) {\n                    return key === 'req'?$req:Reflect.get(target, key, receiver);\n                }\n            });\n    };\n   /**\n    * @method\n    * @description 发送一个POST请求\n    * @param {string} url - 请求的URL\n     * @param {Object} data - 请求的数据\n     * @returns {Promise} 返回一个Promise对象\n     */\n    post = function($data, $ext){\n        let $opts    = toRequest.apply(this.req, [this.req, $data, $ext]);\n        if($opts){\n            $opts.method = 'POST';\n        }\n        return send.apply(this,[$opts, $ext]);\n    };\n   /**\n     * @method \n     * @description 发送一个GET请求\n     * @param {string} url - 请求的URL\n     * @param {Object} params - 请求的参数\n     * @returns {Promise} 返回一个Promise对象\n     */\n    get = function($data, $ext){\n        let $opts    = toRequest.apply(this,[this.req,$data, $ext]);\n        if($opts){\n            $opts.method = 'POST';\n        }\n        return send.apply(this,[$opts, $ext]);\n    };\n   /**\n     * @method\n     * @description 发送一个请求\n     * @param {string} method - 请求的方法\n     * @param {string} url - 请求的URL\n     * @param {Object} data - 请求的数据\n     * @returns {Promise} 返回一个Promise对象\n     */\n    send = function($data, $ext){\n        let $opts = toRequest.apply(this, [this.req, $data, $ext]);\n        return send.apply(this,[$opts, $ext]);\n    }\n}\n\n\n/**\n * The complete Triforce, or one or more components of the Triforce.\n * @name module:ift.ifetch\n * @type {IFetch}\n * \n */\nconst ifetch= new IFetch();\n/**\n * @function module:ift.defineIFetch\n * @description 定义一个IFetch方法\n * @param {Object} options - 配置选项\n * @returns {IFetch} \n */\nfunction defineIFetch({resolver, timeout, interceptors={}} = {}) {\n    let its = ifetch.interceptors;\n    const _ = new IFetch({\n        resolver,timeout,\n        interceptors:{\n            request:[interceptors.request].concat(its.request.get()),\n           response:[interceptors.response].concat(its.response.get())\n       }\n    });\n    return _;\n}\n\n//# sourceURL=webpack://iFetch/./src/ift.js?");

/***/ }),

/***/ "./src/interceptor.js":
/*!****************************!*\
  !*** ./src/interceptor.js ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ITPRS: () => (/* binding */ ITPRS),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   tri: () => (/* binding */ tri)\n/* harmony export */ });\nconst ITPRS = new WeakMap();\n /**\n * 创建拦截器\n * @class Interceptor\n * @param {Array} [its]\n */\n class Interceptor{\n    constructor(its=[]){\n        its = Array.isArray(its)?[...its]:[its];\n        its = its.filter(i=>!!i)\n        ITPRS.set(this,its);\n    }\n    /**\n     * 添加拦截器,返回值将传递给下一个拦截器,如果没有返回值,将使用前值.\n     * 拦截器的返回值应保持和参数一致:\n     * - ifetch的request拦截器传入参数为数据`data`、额外信息`ext`,拦截器的this为`ifetch.interceptors.request`;\n     * - ifetch的response拦截器传入的参数为数据`data`、额外信息`ext`,拦截器的this为`ifetch.interceptors.esponse`;\n     * - ireqeust的request拦截器传入的参数为配置信息`opts`,额外信息,,拦截器的this为`reqeust.interceptors.request`\n     * - ireqeust的response拦截器传入的参数为配置信息,拦截器的this为`reqeust.interceptors.esponse`\n     * @method\n     * @param {function} fn 添加的执行函数\n     * @returns \n     */\n    use(fn){\n        let its = ITPRS.get(this);\n        its.push(fn);\n        return this;\n    }\n    /**\n     * 移除拦截器\n     * @method\n     * @param {function} fn 要移除的执行函数\n     * @returns \n     */\n    off(fn) {\n        let its = ITPRS.get(this);\n        its?.filter(i =>i!==fn);\n        return this;\n    }\n    /**\n     * 获取所有拦截器\n     * @ignore\n     * @method Interceptor~get\n     * @returns {Array}\n     */\n    get(){\n        return ITPRS.get(this);\n    }\n};\n/**\n * 执行拦截器\n * @ignore\n * @param {*} params \n * @param {*} ctx \n * @returns \n */\nfunction tri(params,ctx){\n    const its = this.get();\n    for(let interceptor of its){\n        try{\n            params = interceptor.apply(ctx,params)||params;\n        }catch(e){\n            return {};\n        }\n    }\n    return params;;\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Interceptor);\n\n//# sourceURL=webpack://iFetch/./src/interceptor.js?");

/***/ }),

/***/ "./src/parse-http-req.js":
/*!*******************************!*\
  !*** ./src/parse-http-req.js ***!
  \*******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ parseHttpReq)\n/* harmony export */ });\nconst parsers = {\n    'json'      : data => JSON.stringify(data),\n    'form'      : data => {\n        const formData = new FormData();\n        data.forEach((k, v) => formData.append(k, v));\n        return formData;\n    },\n    'url': data => {\n        const  searchParams = new URLSearchParams(data);\n        return searchParams.toString();\n    },\n    'urlencode':data=>encodeURIComponent(data)\n};\nfunction parseHttpReq(type, data) {\n    // 用正则从contentType中匹配jons、xml、text等\n    if(!data) return;\n    let key;\n    if(type.indexOf('url')){\n        key = typeof data==='object'?\"url\" : 'urlencode';\n    }else{\n        const match = type.match(/json|form|text|blob/) || ['blob'];\n        key   = match && match[0];\n    }\n    return key ?  parsers[key](data) : data;\n}\n\n//# sourceURL=webpack://iFetch/./src/parse-http-req.js?");

/***/ }),

/***/ "./src/req.js":
/*!********************!*\
  !*** ./src/req.js ***!
  \********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ defineIRequest),\n/* harmony export */   irequest: () => (/* binding */ irequest)\n/* harmony export */ });\n/* harmony import */ var _interceptor_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./interceptor.js */ \"./src/interceptor.js\");\n/* harmony import */ var _parse_http_req_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parse-http-req.js */ \"./src/parse-http-req.js\");\n/**\n * @module req\n * @description This is the main file of the htp module.\n */\n/**\n * @file Manages the configuration settings for the widget.\n */\n\n\n// import {on as $$on, un as $$un, emit as $$emit} from './utils.js';\n\n\nconst REQ_OPTS   = ['method', 'headers', 'mode', 'credentials', 'cache', 'redirect', 'referrer', 'integrity'];\n\n /**\n  * @alias IRequest\n  * @inner\n  * @private\n  * @extends Request\n*/\nclass  IRequest  {\n    constructor({url,data,method,headers,...opts}={},{resolver, parser, interceptors}={}){\n        headers = headers || new Headers();\n        if (headers&&!(headers instanceof Headers)) {\n            let headersEntries = Array.isArray(headers) ? headers : Object.entries(headers);\n            headers            = new Headers(headersEntries);\n        }\n         /**\n         * @property {Object} interceptors\n         * @property {Interceptor} interceptors.request\n         * @property {Interceptor} interceptors.response\n         * @description ift对象的拦截器属性，可以用于在请求发送前或响应返回后进行一些处理。\n         */\n        this.interceptors = {\n            request:  new _interceptor_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](interceptors?.request),\n            response: new _interceptor_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](interceptors?.response)\n        };\n        this.method = method || \"GET\";\n         /**\n         * @property {string|function} url\n         * @description ift对象的拦截器属性，可以用于在请求发送前或响应返回后进行一些处理。\n         */\n        this.url    = typeof url  === 'function' ? url : (v) => v || url;\n         /**\n         * @property {Object|function} data\n         * @description ift对象的拦截器属性，可以用于在请求发送前或响应返回后进行一些处理。\n         */\n        this.data   = typeof data === 'function' ? data : (v) => v || data;\n        Object.assign(this, opts);\n        if (resolver) {\n            this.resolver = resolver;\n        }\n        if (parser) {\n            this.parser = parser;\n        }\n        if(!headers){\n            headers = new Headers();\n        }\n        if(!headers.get('Content-Type')){\n            switch (method) {\n                case \"GET\":\n                    headers.set('Content-Type', 'application/x-www-form-urlencoded');\n                    break;\n                case \"POST\":\n                    headers.set('Content-Type', 'application/json');\n                    break;\n            }\n        }\n         /**\n         * @property {Headers} headers\n         * @description ift对象的拦截器属性，可以用于在请求发送前或响应返回后进行一些处理。\n         */\n        this.headers = headers;\n    }\n    // /**\n    //  * @ignore\n    //  * @param data\n    //  * @param ext\n    //  * @return {{data: *, url: *}}\n    //  */\n    // get(data, ext) {\n    //     const ths  = this, dtaFn = this.data, dta = ths.data(data, ext);\n    //     this.data  = () => data;\n    //     const url  = ths.url();\n    //     data       = ths.parser ? ths.parser(data) : data;\n    //     let opts = {data: dta, url};\n    //     REQ_OPTS.forEach(k => opts[k] = ths[k]);\n    //     opts     = tri.apply(this.interceptors.request, [opts, this]);\n    //     ths.data  = dtaFn;\n    //     return opts;\n    // }\n    /**\n     *\n     * @param data\n     * @param ext\n     * @return {{data: *, url: *}}\n     */\n    toRequest($data, $ext) {\n        let ths  = this, dtaFn = this.data, dta = ths.data($data, $ext);\n        this.data  = () => dta;\n        const url  = ths.url();\n        dta        = ths.parser ? ths.parser(dta) : dta;\n        let opts   = {data: dta, url};\n        REQ_OPTS.forEach(k => opts[k] = ths[k]);\n        // irequest请求拦截器,参数为配置信息\n        opts       = _interceptor_js__WEBPACK_IMPORTED_MODULE_0__.tri.apply(this.interceptors.request, [opts, ths]);\n        ths.data   = dtaFn;\n        if(opts.data){\n            let type   = opts.headers.get('Content-Type');\n            let data   = (0,_parse_http_req_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(type, opts.data);\n            type === 'application/x-www-form-urlencoded' ? opts.url += `?${data}` : opts.body = data;\n        }\n        Reflect.deleteProperty(opts,'data');\n        return opts;\n    }\n\n    /**\n     *\n     * @param data\n     * @return {*}\n     */\n    parser(data) {\n        return data;\n    }\n    /**\n     *\n     * @param data\n     * @return {*}\n     */\n    resolver(data) {\n        return data;\n    };\n}\n/**\n * The complete Triforce, or one or more components of the Triforce.\n * @name module:req.irequest\n * @type {IRequest}\n * \n */\nconst irequest = new IRequest();\n/**\n * \n * 创建一个IRequest对象\n * @function module:req.defineIRequest\n * @param {Object} $opts request配置,同Request\n * @param {Object} $config\n * @returns {IRequest}\n */\nfunction defineIRequest($opts, $config= {}) {\n    let {resolver, parser, interceptors} = $config;\n    if (typeof $opts === 'string') {\n        $opts = {url: $opts};\n    }\n    let {url, method='GET', data, headers, ...opts} = $opts;\n    headers ??= new Headers(irequest.headers.entries());\n    interceptors = {\n        request : [interceptors?.request ].concat(irequest.interceptors.request.get()),\n        response: [interceptors?.response].concat(irequest.interceptors.response.get())\n    };\n    return new IRequest({url, method, data, headers, ...opts},{interceptors, resolver, parser});\n}\n\n\n//# sourceURL=webpack://iFetch/./src/req.js?");

/***/ }),

/***/ "./src/resolve-http-res.js":
/*!*********************************!*\
  !*** ./src/resolve-http-res.js ***!
  \*********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ resolveHttpResponse)\n/* harmony export */ });\nlet resolvers={\n    \"json\": function(rsp){\n        return rsp.json();\n    },\n    \"text\": function(rsp){\n        return rsp.text();\n    },\n    \"blob\": function(rsp){\n        return rsp.blob();\n    }\n}\n\nasync function resolveHttpResponse(rsp) {\n    const contentType = rsp.headers.get('Content-type');\n    // 用正则从contentType中匹配jons、xml、text等\n    const match = contentType.match(/json|xml|text|blob/)||['blob'];\n    const key   = match && match[0];\n    return key ? await resolvers[key](rsp):rsp.text();\n}\n\n\n//# sourceURL=webpack://iFetch/./src/resolve-http-res.js?");

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   emit: () => (/* binding */ emit),\n/* harmony export */   link: () => (/* binding */ link),\n/* harmony export */   on: () => (/* binding */ on),\n/* harmony export */   un: () => (/* binding */ un)\n/* harmony export */ });\n/* harmony import */ var _parse_http_req_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./parse-http-req.js */ \"./src/parse-http-req.js\");\n/**\n * @module utils\n * @ignore\n * @description util set\n */\n\n\nconst cache4subs = new WeakMap();\n\n/**\n * @param k\n * @param fn\n * @param ctx\n */\nfunction on(k, fn, ctx) {\n    ctx || (ctx = this);\n    if (!cache4subs[ctx]) {\n        cache4subs[ctx] = {};\n    }\n    const sub = cache4subs[ctx];\n    sub[k] || (sub[k] = []);\n    sub[k].push(fn);\n}\n\n/**\n * @param k\n * @param fn\n * @param ctx\n */\nfunction un(k, fn, ctx) {\n    ctx || (ctx = this);\n    let subs    = cache4subs[ctx];\n    const index = subs [k]?.indexOf(fn);\n    if (index > -1) {\n        subs [k].splice(index, 1);\n    }\n}\n\n/**\n * @param {string} k\n * @param {*} params\n * @param ctx\n * @return {void}\n */\nfunction emit(k, params, ctx) {\n    let subs = cache4subs[ctx];\n    if(subs && subs[k]){\n        subs[k].forEach(fn => fn.apply(ctx, params));\n    }\n}\n\n/**\n * The link function.\n * @param {any} vm - The vm parameter.\n * @param {ift} htp - The ifetch parameter.\n * @return {void}\n */\nfunction link(vm, htp) {\n    htp.on('before', () => vm.loading = true);\n    htp.on('complete', () => vm.loading = false);\n    htp.on('success', rsp => vm.set && vm.set(rsp));\n}\n// method: 请求的方法，例如：GET, POST。\n// headers: 任何你想加到请求中的头，其被放在Headers对象或内部值为ByteString 的对象字面量中。\n// body: 任何你想加到请求中的 body，可以是Blob, BufferSource, FormData, URLSearchParams, USVString，或ReadableStream对象。注意GET 和 HEAD 请求没有 body。\n// mode: 请求的模式，比如 cors, no-cors, same-origin, 或 navigate。默认值为 cors。\n// credentials: 想要在请求中使用的 credentials：: omit, same-origin, 或 include。默认值应该为omit。但在 Chrome 中，Chrome 47 之前的版本默认值为 same-origin ，自 Chrome 47 起，默认值为 include。\n// cache: 请求中想要使用的 cache mode\n// redirect: 对重定向处理的模式： follow, error, or manual。在 Chrome 中，Chrome 47 之前的版本默认值为 manual，自 Chrome 47 起，默认值为 follow。\n// referrer: 一个指定了no-referrer, client, 或一个 URL 的 USVString 。默认值是about:client。\n// integrity: 包括请求的 subresource integrity 值 (e.g., sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=).\n\n\n\n\n\n//# sourceURL=webpack://iFetch/./src/utils.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var webpackQueues = typeof Symbol === "function" ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 		var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var webpackError = typeof Symbol === "function" ? Symbol("webpack error") : "__webpack_error__";
/******/ 		var resolveQueue = (queue) => {
/******/ 			if(queue && queue.d < 1) {
/******/ 				queue.d = 1;
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 				if(dep[webpackQueues]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					queue.d = 0;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						resolveQueue(queue);
/******/ 					}, (e) => {
/******/ 						obj[webpackError] = e;
/******/ 						resolveQueue(queue);
/******/ 					});
/******/ 					var obj = {};
/******/ 					obj[webpackQueues] = (fn) => (fn(queue));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 			ret[webpackQueues] = x => {};
/******/ 			ret[webpackExports] = dep;
/******/ 			return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue;
/******/ 			hasAwait && ((queue = []).d = -1);
/******/ 			var depQueues = new Set();
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = resolve;
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 			module.exports = promise;
/******/ 			body((deps) => {
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn;
/******/ 				var getResult = () => (currentDeps.map((d) => {
/******/ 					if(d[webpackError]) throw d[webpackError];
/******/ 					return d[webpackExports];
/******/ 				}))
/******/ 				var promise = new Promise((resolve) => {
/******/ 					fn = () => (resolve(getResult));
/******/ 					fn.r = 0;
/******/ 					var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 					currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 				});
/******/ 				return fn.r ? promise : getResult();
/******/ 			}, (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue)));
/******/ 			queue && queue.d < 0 && (queue.d = 0);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./example/index.js");
/******/ 	
/******/ })()
;