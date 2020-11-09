// pages/me/me.js
//获取应用实例
const app = getApp()

Page({
  data: {
    src: '/images/index.png',
    nickName: '未登录',
    isLogin: false,
  },
  getMyInfo: function (e) {
    let info = e.detail.userInfo;
    console.log(e.detail.userInfo);
    this.setData({
      isLogin: true, //确认登陆状态
      src: info.avatarUrl,   //更新图片来源
      nickName: info.nickName, //更新昵称
    })
    app.globalData.isLogin = true
  },
  module: function (e) {
    wx.navigateTo({
      url: "/pages/module/module", // 希望跳转过去的页面
    })
  },
  about: function (e) {
    wx.navigateTo({
      url: "/pages/about/about", // 希望跳转过去的页面
    })
  }
})
