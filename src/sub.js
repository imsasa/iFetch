/**
 * @module sub
 */


const cache4subs = new WeakMap();

/**
 * @function
 * @param k
 * @param fn
 */
export function on(k,fn){
    if(!cache4subs[this]){
        cache4subs[this] = new Subscribers();
    }
    const sub= cache4subs[this];
    sub[k]?.push(fn);
}

/**
 * @function
 * @param k
 * @param fn
 */
export function off(k,fn){
    let subs    = cache4subs[this];
    const index = subs [k]?.indexOf(fn);
    if (index > -1) {
        subs [k].splice(index, 1);
    }
}

/**
 * @function
 * @param {string} k
 * @param {*} params
 */
export function emit(k,params){
    let subs = cache4subs[this];
    subs [k]?.forEach(fn => fn.apply(this, params));
}

// export default class Subscribers{
//     constructor(){
      
//     }
//     on   = subOn;
//     off  = subOff;
//     emit = subEmit;
// }


