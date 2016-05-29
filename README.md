## buptclass-spider

这是一个爬取北邮本部空闲自习室的爬虫。
欢迎fork、star~
欢迎pull request~

>个人博客爬虫介绍：http://bupt-hjm.github.io/2016/05/29/buptclass/

### 使用方法：

#### 第一步：安装依赖与所需支持

`git clone`后安装依赖`npm install`
由于涉及到`node-tesseract`和`gm`，验证码识别与图像处理，还需要本地安装

- [node-tesseract](https://github.com/desmondmorris/node-tesseract)
- [gm](https://github.com/aheckmann/gm),里有官网链接，安装上官网即可
- [tesseract安装包](http://pan.baidu.com/share/link?uk=4010726052&shareid=4251373560&third=0&adapt=pc&fr=ftw)

>下面是我整理的关于它们的链接

**Tesseract 开源的 OCR 识别工具**

- [Tesseract:安装与命令行使用](http://linusp.github.io/2015/04/17/tesseract-install-usage.html)
- [node-tesseract](https://github.com/desmondmorris/node-tesseract)
- [tesseract-ocr 学习笔记](http://www.cnblogs.com/chinanetwind/p/3179513.html)
- [Tesseract-OCR的下载安装](http://www.51testing.com/html/14/87714-3693118.html)

**graphicsmagick 图像处理工具**

- [gm](https://github.com/aheckmann/gm)
- [gm文档](http://aheckmann.github.io/gm/)


### 第二步： 添加配置信息
>如果不打算用mongodb，可以把spider.js里的相关mongo删去或者不予理会（会抛出error不影响程序运行写入json）

下列配置在`spider.js`中

```
//爬虫初始配置(教务系统登录的学号和密码必填)
var url="http://jwxt.bupt.edu.cn";//登录的链接
var db = monk('localhost/byr');//连接本地数据库
var sno = "*********";//此处输入学号
var password = "*********";//此处输入密码
//时间配置
var rule = new schedule.RecurrenceRule();
rule.hour = 10;
rule.minute = 0;
//(默认每天十点)
//时间配置也可不予理会，node一次程序会一开始就打开程序运行一次，之后才是看schedule
```

### 第三步： 运行程序
`node spider.js`

### 关于报错信息

```
{ [Error: Cannot find module '../build/Release/bson'] code: 'MODULE_NOT_FOUND' }
js-bson: Failed to load c++ bson extension, using pure JS version
```

>报这个错可以参看https://github.com/Automattic/mongoose/issues/2285
可以不予理会

```
{ [Error: socket hang up] code: 'ECONNRESET', response: undefined }
```

>程序到识别出验证码后，没有出现登录成功，程序不运行，可等待一会即会报上面这个错，检查学号和密码是否输入正确


---

### 后期优化：

- 优化代码风格，减少代码冗余
- 更优雅地解决异步回调问题

---

### 关于该爬虫支持的网站

#### 网站访问地址：

http://buptclass.com/

#### 网站截图(pc端效果)：

<img src="http://7xp9v5.com1.z0.glb.clouddn.com/FireShot%20Capture%2014%20-%20%E5%8C%97%E9%82%AE%E6%9C%AC%E9%83%A8%E8%87%AA%E4%B9%A0%E5%AE%A4%20-%20http___buptclass.com_.png" alt="">

#### 网站截图(手机端效果)：

<img src="http://7xp9v5.com1.z0.glb.clouddn.com/mobile.PNG" alt="">