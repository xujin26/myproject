// pages/add/add.js
var util = require('../../utils/util.js');
const app = getApp()
const db = wx.cloud.database()
const labels = db.collection('labels')
const lessonTmplId = 'nLyK8ccVevK0L3GXa1XTTX3M2e8LXR01rXLgASJxIA8';//订阅事项模板ID

Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: "1",
    label: "默认标签",
    title: "",
    content: "",
    doc: "",
    picture: "",
    labelsList: [],
    showDialog: false,
    //attDialog: false,
    key: "",
    imgbox: [],//选择图片
    fileIDs: [],//上传云存储后的返回值
    show: false,
    disabled:false
  },
  bindFormSubmit: function (e) {
    console.log(e.detail.value);
    //获得表单数据
    var objData = e.detail.value;
    if(!objData.title){
      wx.showToast({
        icon: 'none',
        title: '标题不可为空'
      });
    }else{
      this.setData({
        disabled: true
      });
      if (!this.data.label) {
        this.data.label = "默认标签";
      }
      objData.label = this.data.label;
      app.globalData.label = this.data.label;
      app.globalData.title = objData.title;
      
      /**
       * 获取提醒的日期
       */
      var dayNum = [0, 0, 0.5, 1, 2, 4, 7, 15]; //生成一个新的空数组
      var timeNum = [5, 30, 0, 0, 0, 0, 0, 0]; //生成一个新的非空数组，数组元素可以是任何类型
      var timestamp = new Date().getTime();
      var timestamp1;
      var timestamp2;
      var startTime = [];
  
      var day = [];
      //console.log(timestamp)
      for (var i = 0; i <= 7; i++) {
        //天数*24小时
        timestamp1 = timestamp + (dayNum[i] * 24) * 60 * 60 * 1000;
        //分钟*60秒
        timestamp1 = timestamp1 + (timeNum[i] * 60) * 1000;
        startTime[i] = timestamp1;
        var dayText = util.formatDay(timestamp1, 'Y-M-D')
        //console.log('下次提醒时间：', dayText)
        day[i] = dayText;
      }
      app.globalData.startTime = startTime//时间戳
      console.log(app.globalData.startTime)
  
      var startTimeString = [];
      for (var j = 0; j <= 7; j++) {
        //天数*24小时
        timestamp2 = timestamp + (dayNum[j] * 24) * 60 * 60 * 1000;
        //分钟*60秒
        timestamp2 = timestamp2 + (timeNum[j] * 60) * 1000;
        //console.log(timestamp1)
        var dayText1 = util.formatTime(timestamp2, 'Y-M-D h:m:s')
        //console.log('下次提醒时间：', dayText)
        startTimeString[j] = dayText1;//提醒的年、月、日、小时、分、秒
      }
      app.globalData.startTimeString = startTimeString
      console.log(app.globalData.startTimeString)
  
  
      //var getdata = this.data;存储到数据库
      const db = wx.cloud.database();
      db.collection("items").add({
      data:{
        label: objData.label,
        title: objData.title,
        content: objData.content,
        pic: app.globalData.fileID,
        day: day,
        startTimeString: startTimeString,
        startTime: startTime,
        counter: 1
        }
      }).then(res => {
        console.log("添加至数据库成功", res)
        app.globalData.subscribe_id = res._id;
        this.setData({
          show: !this.data.show
        });
        
        db.collection("items").where({//添加数据库成功后，查询此标签事项数量
          label: this.data.label
        }).count().then(res => {
          console.log(res.total)
          app.globalData.num = res.total
          //var that = this
          db.collection("labels").where({//查询此标签_id
            label: app.globalData.label
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
        app.globalData.fileID = "";
      }).catch(res => {
        console.log("添加失敗", res)
      })
    }  
  },
  x4: function () {//取消退出
    this.setData({
      show: !this.data.show,
    });
    wx.switchTab({
      url: "/pages/index/index", // 希望跳转过去的页面,存储成功后跳转
    })
  },
  

  x5: function () {//取消退出
    this.setData({
      show: !this.data.show,
    });
    wx.switchTab({
      url: "/pages/index/index", // 希望跳转过去的页面,存储成功后跳转
    });
    app.globalData.show = true;
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
                  time1: { value: app.globalData.startTimeString[0] },
                  thing2: { value: app.globalData.title },
                },
                startTime: app.globalData.startTime[0],
                templateId: lessonTmplId,
                page: "pages/index/index",
                id: app.globalData.subscribe_id,
                label: app.globalData.label
              },
            })
            .then(() => {
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

  selectlabel:function(e){//点击选择标签
    this.setData({flag: '0'});
    this.setData({
      disabled: true
    });
    if (getCurrentPages().length != 0) {
      //刷新标签列表
      getCurrentPages()[getCurrentPages().length - 1].onShow()
    }
  },

  changelabel: function (e) {//选择想要的标签
    var label = e.currentTarget.dataset.index;
    console.log(label);
    this.setData({flag:'1'});
    this.setData({label:label});
    this.setData({
      disabled: false
    });
  },
  toggleDialog() {
    this.setData({flag:'1'});
    this.setData({
      disabled: false
    });
  },

  Addlabel: function (e) {//添加标签
    this.setData({
      showDialog: !this.data.showDialog,
    });
    this.setData({ flag: '1' });
    this.setData({
      disabled: true
    });
  },
  
  x1:function (){//取消退出
    this.setData({
      showDialog: !this.data.showDialog,
      'inputValue': ''
    });
    this.setData({
      disabled: false
    });
  },
  Submit: function (e) {//确定
    console.log(e.detail.value);
    if (!e.detail.value.key) {
      wx.showToast({
        icon: 'none',
        title: '标签为空'
      });
    }else{
      const thisID = labels.where({ label: e.detail.value.key })
      return thisID.get().then(res => {
        if (res.data.length !== 0) {//如果不存在
          wx.showToast({
            icon: 'none',
            title: '标签已存在'
          });
        }else{
          this.setData({//返回添加页面
            showDialog: !this.data.showDialog,
            'inputValue': ''
          })
          this.setData({
            disabled: false
          });
          this.setData({ label: e.detail.value.key })//赋值
          db.collection("labels").add({//添加到labels表
            data: {
              label: e.detail.value.key,
              num: 0
            }
          }).then(res => {
            console.log("添加至数据库成功", res)
          }).catch(res => {
            console.log("添加失敗", res)
          })
          
          if (getCurrentPages().length != 0) {
            //刷新标签列表
            getCurrentPages()[getCurrentPages().length - 1].onShow()
          }
        }
      });
    }
  },
  
  att: function () {//添加附件
    wx.navigateTo({
      url: "/pages/components/attachment/attachment", // 希望跳转过去的页面
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options)
    if (options) {//标签存在
      this.setData({
        label: options.index
      })
    }
    const thisID = labels.where({ 'label': '默认标签' })
    return thisID.get().then(res => {
      if (res.data.length === 0) {//如果不存在
        labels.add({
          data: {
            label: "默认标签",
            num: 0
          }
        })
        var that = this
        labels.get({//获取标签列表
          success: function (res) {
            console.log(res.data)
            that.setData({
              labelsList: res.data
            })
          }
        })
      }else{
        var that = this
        labels.get({//获取标签列表
          success: function (res) {
            console.log(res.data)
            that.setData({
              labelsList: res.data
            })
          }
        })
      }
    });
  },
  onShow: function () {
    var that = this
    labels.get({//获取标签列表
      success: function (res) {
        console.log(res.data)
        that.setData({
          labelsList: res.data
        })
      }
    })
  },
  onUnload: function() {
    app.globalData.fileID = ""
  },
})

