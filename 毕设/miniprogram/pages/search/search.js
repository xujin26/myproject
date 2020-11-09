// pages/search/search.js
const app = getApp()
const db = wx.cloud.database()
const items = db.collection('items')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemsList: []
  },
  
  bindFormSubmit: function (e) {
    console.log(e.detail.value);
    app.globalData.objData = e.detail.value.key
    var objData = e.detail.value.key
    if (objData) {
      var that = this
      items.where({
        title: db.RegExp({//模糊查询
          regexp: objData,//从搜索栏中获取的value作为规则进行匹配。
          options: 'i',//大小写不区分
        })
      })
      .get({
        success: res => {
          console.log(res.data)
            that.setData({
              itemsList: res.data
            })        
        }
      })
    }else{
      wx.showToast({
        title: '标题不能为空！',
        icon: 'none',
        duration: 1000//持续的时间
      })
    }
  }, 
  gotoDetail:function(e) {
    let index = e.currentTarget.dataset.index;//data-index绑定的_id值
    console.log(e.currentTarget.dataset.index);
    wx.navigateTo({
      url: '/pages/detail/detail?index='+index,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {//删除后返回页面并刷新
    console.log(app.globalData.mydata)
    if (app.globalData.mydata) {
      app.globalData.mydata = false;
      var objData = app.globalData.objData
      console.log(app.globalData.objData)
      if (objData) {
        var that = this
        items.where({
          title: db.RegExp({//模糊查询
            regexp: objData,//从搜索栏中获取的value作为规则进行匹配。
            options: 'i',//大小写不区分
          })
        })
        .get({
          success: res => {
            console.log(res.data)
              that.setData({
                itemsList: res.data
              })
          }
        })
      }
    }
  }
})