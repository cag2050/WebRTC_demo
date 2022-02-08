'use strict'

// 依赖库
var log4js = require('log4js'); // 用于输出日志
var http = require('http'); // 提供HTTP 服务
var https = require('https'); // 提供HTTPS 服务
var fs = require('fs'); // 用于读取文件内容

var socketIo = require('socket.io');
var express = require('express');

var serveIndex = require('serve-index');

// 一个房间里可以同时在线的最大用户数
var USERCOUNT = 3;

// 日志的配置项
log4js.configure({
    appenders: {
        file: {
            type: 'file',
            filename: 'app.log',
            // layout: {
            //     type: 'pattern',
            //     pattern: '%r %p - %m',
            // }
        }
    },
    categories: {
        default: {
            appenders: ['file'],
            level: 'debug'
        }
    }
});

var logger = log4js.getLogger();
logger.debug('logger start');

var app = express();
// app.use(serveIndex('./public'));
// 3.3.2 视图和静态文件: https://weread.qq.com/web/reader/96932510718ff5f9969fda8k4e73277021a4e732ced3b55
app.use(express.static('./public'));

// 设置跨域访问
app.all("*", function (req, res, next) {
    // 设置允许跨域的域名， * 代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin", "*");

    // 允许的header 类型
    res.header("Access-Control-Allow-Headers", "content-type");

    // 跨域允许的请求方式
    res.header("Access-Control-Allow-Methods", "DELETE, PUT, POST, GET, OPTIONS");
    if (req.method.toLowerCase() == 'options') {
        res.send(200); // 让options 尝试请求快速结束
    } else {
        next();
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/room.html')
})

// HTTP 服务
// var http_server = http.createServer(app);
// var io = socketIo(http_server);

// 你的网站证书
// 18.1.1 生成自己的证书: https://weread.qq.com/web/reader/96932510718ff5f9969fda8k90332d3028f903ce92252e0
// 此处使用了提供免费自签名证书的网站，比如 http://www.selfsignedcertificate.com
var options = {
    key: fs.readFileSync('./cert/cert.key'),
    cert: fs.readFileSync('./cert/cert.cert')
}

// HTTPS 服务
var https_server = https.createServer(options, app);
var io = socketIo(https_server);

// 处理连接事件
// io.sockets.on('connection', (socket) => {
io.on('connection', socket => {
    // 中转消息
    socket.on('message', (room, data) => {
        logger.debug('message, room: ' + room + ", data.type:" + data.type);
        socket.to(room).emit('message', room, data);
    });

    // 用户加入房间
    socket.on('join', room => {
        logger.debug('join room: ' + room);
        socket.join(room);
        logger.debug('io.sockets.adapter.rooms:', io.sockets.adapter.rooms)
        // var myRoom = io.sockets.adapter.rooms[room]);
        var myRoom = io.sockets.adapter.rooms.get(room);
        logger.debug('myRoom:', myRoom)
        // var users = (myRoom) ? Object.keys(myRoom.sockets).length : 0;
        var users = myRoom ? myRoom.size : 0;

        logger.debug('the user number of room (' + room + ') is: ' + users);

        // 如果房间里人未满
        if (users < USERCOUNT) {
            // 发给除自己之外的房间内的所有人
            socket.emit('joined', room, socket.id);

            // 通知另一个用户， 有人来了
            if (users > 1) {
                socket.to(room).emit('otherjoin', room, socket.id);
            }
        } else { // 如果房间里人满了
            socket.leave(room);
            socket.emit('full', room, socket.id);
        }
    });

    // 用户离开房间
    socket.on('leave', (room) => {
        // 从管理列表中将用户删除
        socket.leave(room);

        // var myRoom = io.sockets.adapter.rooms[room];
        var myRoom = io.sockets.adapter.rooms.get(room);
        // var users = (myRoom) ? Object.keys(myRoom.sockets).length : 0;
        var users = myRoom ? myRoom.size : 0;
        logger.debug('the user number of room is: ' + users);

        // 通知其他用户有人离开了
        socket.to(room).emit('bye', room, socket.id);

        // 通知用户服务器已处理
        socket.emit('leaved', room, socket.id);
    });
});

// http_server.listen(8000, '0.0.0.0');
https_server.listen(443, '0.0.0.0');
