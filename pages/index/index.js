//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: '欢迎来到Rua城',
    userInfo: {}
  },
  //事件处理函数
  goLog: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  goChatRoom: function () {
    wx.navigateTo({
        url: '../chatRoom/index',
    })
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
  },
  onPullDownRefresh: function () {
    let count = wx.getStorageSync('count') || 0;
    count = count + 1;
    wx.setStorageSync('count', count);
    
    wx.showModal({
        title: '下拉刷新',
        content: `第${count}次刷新`,
    });

    wx.stopPullDownRefresh();
  },
})
