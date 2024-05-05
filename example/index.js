import {defineIRequest} from "../src/req.js";
import {defineIFetch}  from "../src/ift.js";
let req = defineIRequest('http://myip.ipip.net/s',{
    //对返回值进行解析
    resolver:function(data){
        return "req:" + data;
    }
});

let ift = defineIFetch({
    //对返回值进行解析
    resolver:function(data){
        console.log(data);
        return "ift:"+data;
    }
});

ift.interceptors.request.use(function ($data,$ext){
    console.log($data);
    return ['aaa','bbb'];
});
ift.interceptors.request.use(function ($data,$ext){
    console.log($data);
    console.log($ext);
    return ['ccc','bbb'];
});

ift= ift.bind(req);

let res = await ift.send(123,456);
console.log(res);


let ift2 = defineIFetch({
    //对返回值进行解析
    resolver: function(data){
        console.log(data);
        return "ift2:"+data;
    }
});

ift2 = ift2.bind(req);
let res2 = await ift2.send(123,456);
console.log(res2);