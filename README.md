### 书籍《WebRTC音视频实时互动技术：原理、实战与源码分析》的例子

代码组成 | 网址
--- | ---
4.4.5 信令服务器的完整代码 | https://weread.qq.com/web/reader/377320f07260a55337761c1k17e328b022b17e62166fad4
5.7.7 客户端完整例子 | https://weread.qq.com/web/reader/377320f07260a55337761c1k09332a2023b093f65e0888c

### 注意
1. socket.io库使用的版本不同，代码有调整

### 资源
资源 | 说明
--- | ---
sigserver.js | 信令服务
room.html |
public/css/client.css |
public/js/client.js |

### 步骤
1. 启动信令服务：`npm run start`
2. 在本机浏览器中访问：`https://[服务所在机器的ip]:443/` ，然后点击【ConnServer】按钮
3. 在另一台电脑或手机的浏览器中访问：`https://[服务所在机器的ip]:443/` ，然后点击【ConnServer】按钮
4. 即可看到【Local】和【Remote】的视频画面

资料 | 说明
--- | ---
书籍《WebRTC音视频实时互动技术：原理、实战与源码分析》 | https://book.douban.com/subject/35543112/
免费可用的STUN服务器(webrtc必备）| https://gist.github.com/yetithefoot/7592580
测试stun服务器是否可用 | https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

