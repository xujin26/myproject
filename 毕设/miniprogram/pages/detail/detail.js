// pages/detail/detail.js
const app = getApp()
const db = wx.cloud.database()
const items = db.collection('items')
const lessonTmplId = 'nLyK8ccVevK0L3GXa1XTTX3M2e8LXR01rXLgASJxIA8';//订阅消息模板ID
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    note: {
    },
    imagesList: [],
    showDialog: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    app.globalData.id = options.index
    items.doc(options.index).get({
      success: res => {
        console.log(res.data)
        this.setData({
          note: res.data,
        })
        app.globalData.filePath = res.data.pic;
        console.log(app.globalData.filePath);
        var result = [];
        var that = this
        for(var i=0; i<app.globalData.filePath.length;i++){
          wx.cloud.downloadFile({
            fileID: app.globalData.filePath[i],
            success:res => {
              console.log(res.tempFilePath)
              result.push(res.tempFilePath)
              that.setData({
                imagesList: result,
              })
            }
          })
        }
      }
    })
  },
  edit: function (e) {
    console.log(app.globalData.id);
    let id = app.globalData.id;
    wx.navigateTo({
      url: '/pages/edit/edit?id=' + id,
    })
  },
  finish: function (e) {
    items.doc(app.globalData.id).get({
      success: res => {
        app.globalData.count = res.data.counter
        items.doc(app.globalData.id).get({
          success: res => {
            app.globalData.startTime  = res.data.startTime[app.globalData.count];
            app.globalData.startTimeString = res.data.startTimeString[app.globalData.count];
            app.globalData.title = res.data.title;
            app.globalData.label = res.data.label;
            //var that = this
            items.doc(app.globalData.id).update({
              data: {
                // 表示指示数据库将字段自增 1
                counter : _.inc(1)
              },
              success: function(res) {
                console.log(res.data)
              }
            })
          }
        })
      }
    })

    // 调用微信 API 申请发送订阅消息
    wx.requestSubscribeMessage({
      // 传入订阅消息的模板id，模板 id 可在小程序管理后台申请，可同时申请多个
      tmplIds: [lessonTmplId],
      success(res) {
        // 申请订阅成功
        if (res.errMsg === 'requestSubscribeMessage:ok') {
            // 这里将订阅的提醒事项信息调用云函数存入db
          wx.cloud
          .callFunction({
            name: 'subscribe',//调用云函数
            data: {
              data: {
                time1: { value: app.globalData.startTimeString },
                thing2: { value: app.globalData.title },
              },
              startTime: app.globalData.startTime,
              templateId: lessonTmplId,
              page: "pages/index/index",
              id: app.globalData.id,
              label: app.globalData.label
            },
          })
          .then(() => {
            wx.showToast({
              title: '您已添加下次提醒！',
              icon: 'none',
              duration: 1000//持续的时间
            })
            console.log("订阅成功")
          })
          .catch(() => {
            console.log("订阅失败")
          });
        }
      },
      fail(res) {
        console.log(res)
      }
    })
  },
  delete: function (e) {
    this.setData({
      showDialog: !this.data.showDialog
    });
  },
  x1: function () {//取消退出
    this.setData({
      showDialog: !this.data.showDialog,
    });
  },
  x2: function () {//确认删除
    items.doc(app.globalData.id).get({
      success: res => {
        app.globalData.tab  = res.data.label;
      }
    })
    items.doc(app.globalData.id).remove({
      success: function (res) {
        //删除后，返回上一页面
        app.globalData.mydata = true;  //存储数据到app对象上
        wx.navigateBack({
          delta: 1
        })
        console.log("删除成功")
        db.collection("items").where({//查询此标签事项数量
          label: app.globalData.tab
        }).count().then(res => {
          console.log(res.total)
          app.globalData.num = res.total
          var that = this
          db.collection("labels").where({//查询此标签_id
            label: app.globalData.tab
          }).get({
            success: res => {
              console.log(res.data[0]._id)
              app.globalData._id = res.data[0]._id;
              db.collection("labels").doc(app.globalData._id).update({//更新包含此标签的记录数量
                data: {
                  num: app.globalData.num
                },
                success(res) {
                  console.log(res)
                },
                fail() {
                  console.log("更新失败")
                }
              })
            }
          })
        })
      }
    })
    // 这里将订阅的课程信息调用云函数存入db
    wx.cloud
    .callFunction({
      name: 'unsubscribe',
      data: {
        id: app.globalData.id,
      },
    })
    .then(() => {
      console.log("取消订阅成功")
    })
    .catch(() => {
    console.log("取消订阅失败")
    }); 
  },
  /*download: function () {
    console.log(app.globalData.filePath)
    //下载图片
    wx.cloud.downloadFile({
      fileID: app.globalData.filePath,
      success:res => {
        console.log(res.tempFilePath)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            console.log("saveImageToPhotosAlbum success")
          }
        })
      }
    })
  },*/
  previewImage: function (e) {
    var current = e.target.dataset.src;
    console.log(current)
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: this.data.imagesList, // 需要预览的图片http链接列表  
    })
    console.log(this.data)
  }
})