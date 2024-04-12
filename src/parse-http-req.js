const parsers = {
    'json'      : data => JSON.stringify(data),
    'form'      : data => {
        const formData = new FormData();
        data.forEach((k, v) => formData.append(k, v));
        return formData;
    },
    'urlencoded': data => {
        const  searchParams = new URLSearchParams(data);
        return searchParams.toString();
    }
};
export default async function parseHttpReq(contentType, data) {
    // 用正则从contentType中匹配jons、xml、text等
    const match = contentType.match(/json|form|text|blob/) || ['blob'];
    const key   = match && match[0];
    return key ? await parsers[key](data) : data;
}