// pages/tasklist/tasklist.js
const app = getApp()
const db = wx.cloud.database()
const items = db.collection('items')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemsList: [],
  },
  add: function (e) {
    console.log(app.globalData.tab);
    let index = app.globalData.tab;
    app.globalData.fileID = "";
    app.globalData.pic = "";
    wx.navigateTo({
      url: "/pages/add/add?index=" + index, // 希望跳转过去的页面
    })
  },
  slectitem: function (e) {
    let index = e.currentTarget.dataset.index;
    console.log(e.currentTarget.dataset.index);
    wx.navigateTo({
      url: '/pages/detail/detail?index=' + index,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let label = options.index
    app.globalData.tab = options.index
    items.where({
      label:label
    })
    .get({
      success: res => {
        console.log(res.data)
        this.setData({
          itemsList: res.data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {//删除后刷新页面
    let label = app.globalData.tab
    items.where({
      label: label
    })
    .get({
      success: res => {
        console.log(res.data)
        this.setData({
          itemsList: res.data
        })
      }
    })
  },
})