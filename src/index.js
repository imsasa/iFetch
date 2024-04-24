import defineRequest from "./req.js";
import defineIFetch  from "./ift";

let ift = defineIFetch();
let req = defineRequest({url:'http://myip.ipip.net/s'});
let res = await ift.send(req);
console.log(res);
