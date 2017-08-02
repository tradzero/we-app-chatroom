Page({
    data: {
        connect: false,
        currentMessage: '',
        user: {
            self: '杰洛',
            other: {
                
            },
        },
        messages: {
            self: [],
            other: [],
        }
    },
    onLoad: function () {
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
            url: 'ws://127.0.0.1:8282',
        });

        wx.onSocketOpen(function(res) {
            wx.hideLoading();
            wx.showToast({
                title: '连接服务器成功',
                icon: 'success',
            });
            _this.setData({
                connect: true
            });
        });
        
        wx.onSocketError(function(res) {
            wx.hideLoading();
            wx.showModal({
                title: '错误',
                content: '服务器连接失败，请联系管理员或者稍后再试',
            });
            _this.setData({
                connect: false
            });
        });

        wx.onSocketClose(function() {
            wx.showModal({
                title: '连接关闭',
                content: '服务器已经关闭了您的连接',
            });
            _this.setData({
                connect: false
            });
        })
        wx.onSocketMessage(function(data) {
            console.log(data);
        });
    },
    bindInput: function (e) {
        this.setData({
            currentMessage: e.detail.value
        });
    },
    sendMsg: function () {
        if (this.data.connect) {
            var _this = this;
            var message = this.data.currentMessage;
            wx.sendSocketMessage({
                data: message,
                success: function(res){
                    var oldMessages = _this.data.messages.self;
                    oldMessages.push(message);
                    _this.setData({
                        'messages.user.self': oldMessages
                    });
                },
                fail: function(res) {
                    console.log(res);
                },
                complete: function() {
                    _this.setData({
                        currentMessage: '',
                    });
                }
            })
        }
    },
});