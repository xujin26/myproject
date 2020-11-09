// pages/task/task.js
const app = getApp()
const db = wx.cloud.database()
const items = db.collection('items')
const labels = db.collection('labels')
Page({

  /**
   * 页面的初始数据 
   */
  data: {
    labelsList: [],
    num: "",
    showDialog: false,
  },
  toSearch: function () {
    wx.navigateTo({
      url: "/pages/search/search", // 希望跳转过去的页面
    })
  },
  add: function (e) {
    if(!app.globalData.isLogin){
      wx.showToast({
        title: '请先登录！',
        icon: 'none',
        duration: 1000//持续的时间
      })
    }else{
      this.setData({
        showDialog: !this.data.showDialog
      });
    }
  },
  x1: function () {//取消退出
    this.setData({
      showDialog: !this.data.showDialog,
      'inputValue': ''
    });
  },
  Submit: function (e) {//确定
    console.log(e.detail.value);
    if (!e.detail.value.key) {
      wx.showToast({
        icon: 'none',
        title: '标签为空'
      });
    } else {
      this.setData({//返回添加页面
        showDialog: !this.data.showDialog,
        'inputValue': ''
      })
      db.collection("labels").add({//添加到labels表
        data: {
          label: e.detail.value.key,
          num: 0
        }
      }).then(res => {
        console.log("添加至数据库成功", res)
        if (getCurrentPages().length != 0) {
          //刷新当前页面的数据
          getCurrentPages()[getCurrentPages().length - 1].onShow()
        }
      }).catch(res => {
        console.log("添加失敗", res)    
      })
    }
  },
  selectlabel: function (e) {
    let index = e.currentTarget.dataset.index;
    console.log(e.currentTarget.dataset.index);
    wx.navigateTo({
      url: '/pages/tasklist/tasklist?index=' + index,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.isLogin) {
      var that = this
      labels.get({
        success: function (res) {
          console.log(res.data)
          that.setData({
            labelsList: res.data
          })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.isLogin) {
      var that = this
      labels.get({
        success: function (res) {
          console.log(res.data)
          that.setData({
            labelsList: res.data
          })
        }
      })
    }
  },
  editlabel: function (e) {//删除标签
    console.log(e.currentTarget.dataset.index);
    this.setData({
      Dialog: !this.data.Dialog,
    });
    app.globalData.del = e.currentTarget.dataset.index
  },

  exit: function () {//取消退出
    this.setData({
      Dialog: !this.data.Dialog,
    });
  },
  ensure: function () {//确认删除
    this.setData({
      Dialog: !this.data.Dialog,
    })
    labels.where({
      label: app.globalData.del
    }).get({
      success: res => {
        console.log(res.data[0]._id)
        labels.doc(res.data[0]._id).remove({
          success: function (res) {
            console.log("删除成功"); 
            if (getCurrentPages().length != 0) {
              //刷新当前页面的数据
              getCurrentPages()[getCurrentPages().length - 1].onShow()
            }
            wx.cloud//删除该标签下所有事项
              .callFunction({
                name: 'delete',
                data: {
                  label: app.globalData.del
                },
              })
              .then(() => {
                console.log("删除成功")
              })
              .catch(() => {
                console.log("删除失败")
              });
              wx.cloud//取消删除事项的订阅
              .callFunction({
                name: 'delsubscribe',
                data: {
                  label: app.globalData.del
                },
              })
              .then(() => {
                console.log("取消订阅成功")
              })
              .catch(() => {
                console.log("取消订阅失败")
              });
          }
        })
      }
    })
  }
})