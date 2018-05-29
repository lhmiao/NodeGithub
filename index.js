/*
 * Primary file to search github
 * 
 */

const request = require('request');
const cheerio = require('cheerio');
const express=require("express");
var bodyParser = require('body-parser');
 
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var app=express();
//Listen the port
var server=app.listen(6699,function(){
    console.log("the address of server is: http://localhost:%s:%s",server.address().address,server.address().port);
});

app.use(express.static('static'));

app.post('/repository',urlencodedParser,function(req,res){
    let repository=encodeURI(req.body.repository);

    let target={
        url:"https://github.com/search?q="+repository,
        method:"get",
        headers:{
            "User-Agent": "request/2.85.0"
        }
    };

    console.log(target.url);

    request(target, (err, gitRes, body) => {
        console.log(gitRes.statusCode);
        const result ={
            "errCode":0,
            "errMsg":""
        };
        if(gitRes.statusCode==200){
            const $=cheerio.load(body);
            var content=$("a.filter-item").text();
            content=content.split(/\s+/);
            content.shift();
            content.pop();
            result.data={};
            if(content.length!=0){
                for(let i=0;i<content.length;i+=2){
                    let number=content[i].replace(/,/g,"");
                    if(typeof(+number)!=='number'){
                        result.errCode=30;
                        result.errMsg="html解析出现异常";
                    }
                    result.data[content[i+1]] = number;
                }
            }
            else{
                result.errCode=20;
                result.errMsg="未找到相关的仓库";
            }
        }
        else{
            result.errCode=10;
            result.errMsg="向github请求失败";
        }
        res.send(JSON.stringify(result));
    });
});
