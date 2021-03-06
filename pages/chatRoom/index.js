var app = getApp();
var config = require('../../config.js');

Page({
    data: {
        connect: false,
        currentMessage: '',
        user: {
            self: {},
            other: {},
        },
        messages: [],
        deviceHeight: 0,
    },
    onLoad: function () {
        console.log(app.globalData.userInfo);
        this.setData({
            'user.self': app.globalData.userInfo
        });
    },
    onReady: function () {
        var _this = this;
        wx.showLoading({
            title: '连接服务器中',
            fail: function () {
                wx.showModal({
                    title: '错误',
                    content: '不支持的微信版本，请升级微信',
                });
            }
        });

        wx.connectSocket({
            url: config.config.wsurl,
        });

        wx.onSocketOpen(function (res) {
            wx.hideLoading();
            wx.showToast({
                title: '连接服务器成功',
                icon: 'success',
            });
            _this.setData({
                connect: true
            });
        });

        wx.onSocketError(function (res) {
            wx.hideLoading();
            wx.showModal({
                title: '错误',
                content: '服务器连接失败，请联系管理员或者稍后再试',
            });
            _this.setData({
                connect: false
            });
        });

        
        wx.onSocketClose(function () {
            if (_this.data.connect) {
                wx.showModal({
                    title: '连接关闭',
                    content: '服务器已经关闭了您的连接',
                });
                _this.setData({
                    connect: false
                });
            }
        });
    
        wx.onSocketMessage(function (data) {
            var body = JSON.parse(data.data);
            console.log(body);
            switch (body.type) {
                case 'login':
                    // todo: 用户进入提示
                    break;
                case 'message':
                    _this.receiveMsg(body.message, body.client, body.userInfo);
                    break;
                case 'logout':
                    // todo: 移除用户逻辑
                    break;
                case 'number':
                    _this.showNumber(body.message);
                    break;
                case 'ping':
                    _this.sendPong();
                    break;
                default:
                    break;
            }
        });
    },
    onUnload: function () {
        this.setData({
            connect: false
        });
        wx.closeSocket();
    },
    bindInput: function (e) {
        this.setData({
            currentMessage: e.detail.value,
        });
    },
    sendMsg: function () {
        if (this.data.connect && this.data.currentMessage.trim()) {
            var _this = this;
            var message = this.data.currentMessage;
            var messageBody = this.getMessageBody(message);
            wx.sendSocketMessage({
                data: JSON.stringify(messageBody),
                success: function (res) {
                    var messageBody = {message: message};
                    _this.pushMsg('self', messageBody);
                },
                fail: function (res) {
                    console.log(res);
                },
                complete: function () {
                    _this.setData({
                        currentMessage: '',
                    });
                }
            })
        }
    },
    getNumber: function () {
        if (this.data.connect) {
            var messageBody = this.getNumberBody();
            wx.sendSocketMessage({
                data: JSON.stringify(messageBody),
                success: function (res) {
                    console.log(res);
                },
            })
        }
    },
    receiveMsg: function (message, client, userInfo) {
        var messageBody = {message, client};
        if (this.data.user.other[client] == undefined) {
            var userList = this.data.user.other || {};
            userList[client] = userInfo;
            this.setData({ 'user.other': userList });
        }
        this.pushMsg('others', messageBody);
    },
    getMessageBody: function (message) {
        var messageBody = {
            type: 'message',
            message: message,
            userInfo: {
                nickName: this.data.user.self.nickName,
                avatarUrl: this.data.user.self.avatarUrl,
            }
        };
        return messageBody;
    },
    getNumberBody: function () {
        var messageBody = {
            type: 'number',
        };
        return messageBody;
    },
    back: function () {
        wx.navigateBack({
            delta: 1,
        })
    },
    showNumber: function (number) {
        wx.showModal({
            title: '提示',
            content: `在线人数${number}`,
        });
    },
    pushMsg: function (side, body) {
        var tempateBody = this.data.messages || [];
        tempateBody.push({ [side]: body });
        this.setData({
            messages: tempateBody,
        });
    },
    // 回应心跳检测
    sendPong: function () {
        var body = {
            type: 'pong',
        }
        wx.sendSocketMessage({
            data: JSON.stringify(body),
        })
    }
});