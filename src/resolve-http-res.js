let resolvers={
    "json": function(rsp){
        return rsp.json();
    },
    "text": function(rsp){
        return rsp.text();
    },
    "blob": function(rsp){
        return rsp.blob();
    }
}

export default async function resolveHttpResponse(rsp) {
    const contentType = rsp.headers.get('Content-type');
    // 用正则从contentType中匹配jons、xml、text等
    const match = contentType.match(/json|xml|text|blob/)||['blob'];
    const key   = match && match[0];
    return key ? await resolvers[key](rsp):rsp.text();
}
