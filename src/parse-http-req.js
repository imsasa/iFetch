const parsers = {
    'json'      : data => JSON.stringify(data),
    'form'      : data => {
        const formData = new FormData();
        data.forEach((k, v) => formData.append(k, v));
        return formData;
    },
    'url': data => {
        const  searchParams = new URLSearchParams(data);
        return searchParams.toString();
    },
    'urlencode':data=>encodeURIComponent(data)
};
export default  function parseHttpReq(type, data) {
    // 用正则从contentType中匹配jons、xml、text等
    if(!data) return;
    let key;
    if(type.indexOf('url')){
        key = typeof data==='object'?"url" : 'urlencode';
    }else{
        const match = type.match(/json|form|text|blob/) || ['blob'];
        key   = match && match[0];
    }
    return key ?  parsers[key](data) : data;
}