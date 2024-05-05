export const ITPRS = new WeakMap();
 /**
 * 创建拦截器
 * @class Interceptor
 * @param {Array} [its]
 */
 class Interceptor{
    constructor(its=[]){
        its = Array.isArray(its)?[...its]:[its];
        its = its.filter(i=>!!i)
        ITPRS.set(this,its);
    }
    /**
     * 添加拦截器,返回值将传递给下一个拦截器,如果没有返回值,将使用前值.
     * 拦截器的返回值应保持和参数一致:
     * - ifetch的request拦截器传入参数为数据`data`、额外信息`ext`,拦截器的this为`ifetch.interceptors.request`;
     * - ifetch的response拦截器传入的参数为数据`data`、额外信息`ext`,拦截器的this为`ifetch.interceptors.esponse`;
     * - ireqeust的request拦截器传入的参数为配置信息`opts`,拦截器的this为`reqeust.interceptors.request`
     * - ireqeust的response拦截器传入的参数为配置信息,拦截器的this为`reqeust.interceptors.esponse`
     * @method
     * @param {function} fn 添加的执行函数
     * @returns 
     */
    use(fn){
        let its = ITPRS.get(this);
        its.push(fn);
        return this;
    }
    /**
     * 移除拦截器
     * @method
     * @param {function} fn 要移除的执行函数
     * @returns 
     */
    off(fn) {
        let its = ITPRS.get(this);
        its?.filter(i =>i!==fn);
        return this;
    }
    /**
     * 获取所有拦截器
     * @ignore
     * @method Interceptor~get
     * @returns {Array}
     */
    get(){
        return ITPRS.get(this);
    }
};
/**
 * 执行拦截器
 * @ignore
 * @param {*} params 
 * @param {*} ctx 
 * @returns 
 */
export function tri(params,ctx){
    const its = this.get();
    for(let interceptor of its){
        try{
            params = interceptor.apply(ctx,params) || params;
        }catch(e){
            return {};
        }
    }
    return params;;
}
export default Interceptor;