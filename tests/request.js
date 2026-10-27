import { Readable } from 'node:stream';

// Exercise the actual HTTP request handler without binding a network port.
export function request(server,path,{method='GET',headers={},body='',address='127.0.0.1'}={}) {
  return new Promise((resolve,reject)=>{
    const req=Readable.from(body?[Buffer.from(body)]:[]);
    req.url=path;req.method=method;req.headers={host:'localhost:3000',...headers};req.socket={remoteAddress:address};
    const response={statusCode:200,headers:{},headersSent:false,setHeader(key,value){this.headers[key.toLowerCase()]=value;},writeHead(status,values={}){this.statusCode=status;Object.entries(values).forEach(([key,value])=>this.setHeader(key,value));this.headersSent=true;},end(data){const text=data?.toString()||'';resolve({status:this.statusCode,headers:this.headers,text:async()=>text,json:async()=>JSON.parse(text)});}};
    req.on('error',reject);
    server.emit('request',req,response);
  });
}
