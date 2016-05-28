//爬虫初始配置
var url="http://jwxt.bupt.edu.cn";//登录的链接
var db = monk('localhost/byr');//连接本地数据库
var sno = "********";//此处输入学号
var password = "*********";//此处输入密码
//时间配置
rule.hour = 10;
rule.minute = 0;

//引入模块
var superagent = require('superagent-charset');
var cheerio = require("cheerio");
var fs = require("fs");
var tesseract = require('node-tesseract');
var gm = require('gm');
var async = require('async');
var monk = require('monk');
var mongo = require('mongodb');
var schedule = require('node-schedule');


//让爬虫更像浏览器
var headers = {
    Host: 'jwxt.bupt.edu.cn',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36'
};
var headers1={
    Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding':'gzip, deflate',
    'Accept-Language':'zh-CN,zh;q=0.8',
    'Cache-Control':'max-age=0',
    Connection:'keep-alive',
    'Content-Length':48,
    'Content-Type':'application/x-www-form-urlencoded',
    Host:'jwxt.bupt.edu.cn',
    Origin:'http://jwxt.bupt.edu.cn',
    Referer:'http://jwxt.bupt.edu.cn/jwLoginAction.do',
    'Upgrade-Insecure-Requests':1,
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36'
}

var headers2={
    Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding':'gzip, deflate',
    'Accept-Language':'zh-CN,zh;q=0.8',
    'Cache-Control':'max-age=0',
    Connection:'keep-alive',
    'Content-Length':0,
    'Content-Type':'application/x-www-form-urlencoded',
    Host:'jwxt.bupt.edu.cn',
    Origin:'http://jwxt.bupt.edu.cn',
    Referer:'http://jwxt.bupt.edu.cn/jxlCxAction.do?oper=ori',
    'Upgrade-Insecure-Requests':1,
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36'
}

var headers3={
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding':'gzip, deflate, sdch',
    'Accept-Language':'zh-CN,zh;q=0.8',
    'Connection':'keep-alive',
    'Host':'jwxt.bupt.edu.cn',
    'Referer':'http://jwxt.bupt.edu.cn/wkjasAction.do?oper=ori&xqh=01&jxlh=01',
    'Upgrade-Insecure-Requests':1,
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36'
}

//必要变量声明
var cookie;
var CAPTHA;
var study = [];
var index = 0;
var buildings = ['主楼','教一','教二','教三','教四','图书馆'];
var gogogo = schedule.scheduleJob(rule,getImg());

/**
 * 通过supergent模块获取验证码图片与访问cookie
 * 通过fs模块写入图片
 * 最后调用识别验证码函数
 * @return {[type]} [description]
 */
function getImg(){
    superagent.get(url)
        .set(headers)
        .end(function (err, res) {
            if (err) {
                return next(err);
            }
            var $ = cheerio.load(res.text);
            cookie = res.headers['set-cookie'];
            var src = $('#vchart').attr('src');
            //console.log($('#vchart').attr('src'));
            //console.log(cookie);

            var stream = fs.createWriteStream('first.jpg');
            var req = superagent.get(url+src).set('Cookie',cookie);
            req.pipe(stream);

            setTimeout(getCAPTHA, 1000); //停止一会儿让图片写入
        });
}
/**
 * 通过gm模块识别验证码
 * 调用登录函数
 * @return {[type]} [description]
 */
function getCAPTHA(){
    gm("first.jpg")
    .despeckle()//去斑
    .contrast(-100)//对比度调整
    .write('gm.jpg',function(err) {
        if(err) {
            console.log(err);
        }
    });
    var options = {
        l: 'eng',
        psm: 6,
        binary: 'tesseract'
    };

    tesseract.process('gm.jpg', options, function(err, text) {
        if(err) {
            console.error(err);
        } else {
            console.log("识别出的验证码为----"+text.trim());
            //console.log(text.trim().length);
            var re =new RegExp("^[a-zA-Z0-9]{4}$");
            if(!re.test(text.trim())) {
                console.log("识别的验证码不符合要求"+"\n")
                return getImg();
            }
            CAPTHA = text.trim();
            login();
        }
    });
}
/**
 * 调用superagent模块模拟登录教务系统
 * @return {[type]} [description]
 */
function login(){
    console.log("\n"+"传入的验证码为----"+CAPTHA);
    console.log("传入的cookie为----"+cookie);
    //登录教务系统
    superagent.post("http://jwxt.bupt.edu.cn/jwLoginAction.do")
        .set(headers1)
        .set("Cookie",cookie)
        .type('form')
        .send({type:"sso"})
        .send({zjh:sno})
        .send({mm:password})
        .send({v_yzm:CAPTHA})
        .end(function(err, res) {
            if (err) {
                return console.log(err);
            }
            $=cheerio.load(res.text);
            if($("form").attr('name')) {
                console.log("验证码登录失败");
                return getImg();
            }
            console.log("登录成功");
            console.log("------------------------------");
            var count1 = 0;
            async.whilst(//处理异步
                function() { return count1 <= 5 },
                function(cb) {
                    console.log("爬取"+buildings[count1]);
                    spiderGo(count1);
                    count1++;
                    setTimeout(cb, 2000);
                },
                function(err) {
                    console.log("爬取成功")
                    //console.log('1.1 err: ', err); // -> undefined
                    var byrclass = db.get('byrclass');//数据库处理
                    byrclass.insert(study,function(err,doc){
                        if (err) console.log(err);
                        else console.log("数据库写入成功")
                    });
                    db.close();
                }
            );
    });
}


/**
 * 通过不同的参数爬取空闲教室并存储，参数即为教学楼编号
 * @param  {[type]} arg [description]
 * @return {[type]}     [description]
 */
function spiderGo(arg){
    //console.log("教室为"+arg);
    superagent.post("http://jwxt.bupt.edu.cn/wkjasAction.do?oper=ori&xqh=01&jxlh=0"+arg)
        .set(headers2)
        .set("Cookie",cookie)
        .end(function(err, res){
            if (err) {
                console.log(err);
            }
            //console.log(arg);
            //通过cheerio模块处理信息
            //通过fs模块写入
            superagent.get("http://jwxt.bupt.edu.cn/wkjasAction.do?oper=jasxx")
                .charset("gbk")
                .set(headers3)
                .set("Cookie",cookie)
                .end(function(err, res){
                      if (err) {
                        console.log(err);
                    }
                    $=cheerio.load(res.text);
                    //处理页面使得更好爬取
                    $('head').html("<meta charset='utf-8'><style></style>")
                    $("tr").each(function(i,el) {
                        $(this).find("td").eq(37).remove();
                        $(this).find("td").eq(73).remove();
                    });
                    $("tr").each(function(i,el) {
                        if($(this).find("td").eq(0).text().trim() == "星期")
                        {
                            $(this).find("td").eq(4).remove();
                            $(this).find("td").eq(7).remove();
                        }
                    });
                    //分块分天爬取
                   for(var j = 1;j <8; j++){
                        var date = $("tr").eq(0).find("td").eq(j).text().slice(0,3);
                        for(var t = 12*(j-1)+1; t < j*12; t++) {
                            //略去无用的爬取
                            if(t == 12*(j-1)+2||t == 12*(j-1)+4||t == 12*(j-1)+6||t == 12*(j-1)+8||t == 12*(j-1)+11) {
                                continue;
                            }
                            $("tr").each(function(i, elem){
                                if(($(this).find("td").eq(t).attr("width")=="10") && ($(this).find("td").eq(t).attr("bgcolor")=="white")) {
                                    var classNu = t-12*(j-1)+"-"+(t+1-12*(j-1))+"节";
                                    if((t-12*(j-1)) == 9) {
                                        classNu = "9节";//特殊处理
                                    }
                                    var classroomNu = $(this).find("td").eq(0).text().trim().slice(0,5);
                                    var zixi = {
                                            date: date,
                                            building: buildings[arg],
                                            classNu: classNu,
                                            classroomNu: classroomNu
                                    }
                                    study.push(zixi);
                                }
                            });
                        }

                    }
                    //写入文件
                    var json = JSON.stringify(study);
                    fs.writeFile("./test.json", json, 'utf-8', function(err){
                        if (err) {console.log(err)}
                        console.log('JSON写入成功');
                        console.log("------------------------------");
                    });
            });
    });
}




