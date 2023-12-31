function config($req) {
    const opt      = {};
    // ['method', 'headers'].forEach((i) => opt[i] = $req[`_${i}`]);
    opt['method']  = $req.method;
    opt['headers'] = $req._headers;
    if ($req.timeout) {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), $req.timeout);
        opt.signal = controller.signal;
    }
    opt.body = $req.body();
    return opt;
}

class IFetch {
    /**
     * @constructor
     * @param {String} $input the resource url
     * @param {Object} [$opts] http request option,eg,method,headers,baseURL etc.
     */
    constructor($input, $opts = {}) {
        // let evt      = new EventTarget();
        this.timeout      = $opts.timeout;
        this.method       = $opts.method;
        this._body        = $opts.body;
        this._headers     = new Headers($opts.headers);
        this._url         = $input;
        this.baseURL      = $opts.baseURL;
        const subscribers = {
            "before-request": [],
            "after-request" : []
        };
        const ths         = this;

        function trigger(subscribers = [], params) {
            subscribers.forEach(fn => fn.apply(this, params));
        }

        /**
         *
         * add event
         * @method
         * @return {Promise<Response|{retmsg, retcode}>}
         */
        this.http = async function $http() {
            const requestCfg = config(this);
            trigger(subscribers["before-request"], [requestCfg]);
            const input = `${this.baseURL || this.constructor.baseURL || ''}${this._url}`;
            ths.loading = true;
            if (this._headers.get('Content-Type')?.indexOf('json') > 0) {
                requestCfg.body = JSON.stringify(requestCfg.body);
            }
            let rsp = await fetch(input, requestCfg).catch(rsp => {
                return {retcode: rsp.code || '0000', retmsg: rsp.message || '发送请求发生错误'};
            });
            if (this._headers.get('Content-Type')?.indexOf('json') > 0) {
                rsp = await rsp.json();
            }
            if ($opts.parser) {
                rsp = $opts.parser(rsp);
            }
            this.loading = false;
            trigger(subscribers["after-request"], [rsp]);
            return rsp;
        };
        /**
         * add event
         * @method
         * @param k
         * @param fn
         * @return {IFetch}
         */
        this.on = function (k, fn) {
            subscribers[k]?.push(fn);
            // evt.addEventListener(k, fn);
            return this;
        };
        /**
         * remove event;
         * @method
         * @param k
         * @param fn
         * @return {IFetch}
         */
        this.off = function (k, fn) {
            const index = subscribers[k]?.indexOf(fn);
            if (index > -1) {
                subscribers[k].splice(index, 1);
            }
            return this;
            // evt.removeEventListener(k, fn);
        };
    }

    /**
     * 设置body，如果什么参数都不传入，则返回body的值，如果传入参数则返回this对象。
     * 如果K的类型是对象，v的值为true，则用K的值替换body。
     * @method
     * @param {Object|String} [k] 设置的body名
     * @param {Object|String}[v] body的值
     * @return {*|(function(*, *): (*|{}))|IFetch}
     */
    body(k, v) {
        if (k === undefined && v === undefined) return this._body;
        if (!this._body) {
            this._body = {};
        }
        const body = this._body;
        if (arguments.length < 2 && typeof k === 'string') {
            return body && body[k];
        }

        if (typeof k === 'string') {
            body[k] = v;
        } else {
            // 如果v为ture，则用v覆盖原来的body值
            v ? this._body = k : Object.assign(body, k);
        }
        return this;
    }

    /**
     * 设置header，如果什么参数都不传入，则返回header的值，如果传入参数则返回this对象。
     * 如果K的类型是对象，v的值为true，则用K的值替换body
     * @method
     * @param {Object|String} [k] 设置的header名
     * @param {Object|String}[v]  设置的body名
     * @return {*|(function(*, *): (*|{}))|IFetch}
     */
    header(k, v) {
        if (arguments.length === 2) {
            this._headers.set(k, v);
            return this;
        }
        if (arguments.length === 1) {
            if (typeof k === 'object') {
                // 如果提供了一个对象，遍历该对象并设置多个头部信息
                for (const [key, value] of Object.entries(k)) {
                    this._headers.set(key, String(value));
                }
                return this;
            } else {
                // 如果提供了一个字符串，返回该键对应的值
                return this._headers.get(k);
            }
        }
        return this._headers;
    }

    /**
     * 设置或获取请求的URL
     * @method
     * @param {String} $url
     * @return {any}
     */
    url($url) {
        if (!$url) return this._url;
        this._url = $url;
        return this;
    }

    /**
     * 发起post请求
     * @method
     * @param {Object|String} [$data]
     * @param {String} [$url]
     * @return {Promise<Response|{retmsg, retcode}>}
     */
    post($data, $url) {
        if ($data) {
            this.body($data);
        }
        if ($url) {
            this.url($url);
        }
        this.method = "POST";
        if (!this._headers.has('Content-Type')) {
            this._headers.set('Content-Type', "application/json;charset=utf-8");
        }
        return this.http();
    }

    /**
     * 发起get请求
     * @method
     * @param {Object|String} [$params]
     * @param {String} [$url]
     * @return {Promise<Response|{retmsg, retcode}>}
     */
    get($params, $url) {
        if ($url) {
            this.url($url);
        }
        let queryString = "";
        if ($params) {
            const searchParams = new URLSearchParams($params);
            queryString        = `?${searchParams.toString()}`;
        }
        this.method = "GET";
        return this.http(`${this._url}${queryString}`);
    }

    // link($vm) {
    //     this.constructor.link(this, $vm);
    //     return this;
    // }
    // static link($req, $vm) {
    //     $req.on('before-request', () => {
    //         $vm.loading = true;
    //     });
    //     $req.on('after-request', (rsp) => {
    //         $vm.loading = false;
    //         $vm.set && $vm.set(rsp);
    //     });
    //     return this;
    // }
}

// export class Post extends IFetch {
//     constructor($input, $opts = {method: "POST"}) {
//         super($input, $opts);
//         this.method = "POST";
//         // if (!this.headers.has('Content-Type')) {
//         //     this.headers.set('Content-Type', "application/json;charset=utf-8");
//         // }
//         // let headers = new Headers(this.headers);
//         // debugger;
//     }
//
//     static baseURL = ''
// }
export default IFetch