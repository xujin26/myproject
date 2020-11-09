// pages/edit/edit.js
const app = getApp()
const db = wx.cloud.database()
const labels = db.collection('labels')
const items = db.collection('items')
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
    attDialog: false,
    key: "",
    imgbox: [],//选择图片
    fileIDs: [],//上传云存储后的返回值
    disabled:false
  },
  bindFormSubmit: function (e) {
    console.log(e.detail.value);
    //获得表单数据
    var objData = e.detail.value;
    objData.label = this.data.label;
    objData.picture = app.globalData.fileID;
    if(!objData.title){
      wx.showToast({
        icon: 'none',
        title: '标题不可为空'
      });
    }else{
      this.setData({
        disabled: true
      });
      db.collection("items").doc(app.globalData.id).update({//更新数据库记录
        data: {
          label: objData.label,
          title: objData.title,
          content: objData.content,
          pic: app.globalData.fileID
        },
        success(res) {
          console.log(res)
          app.globalData.fileID = "";
          //更新items成功后再更新标签
          if (app.globalData.label != objData.label) {
            wx.cloud
            .callFunction({
              name: 'update',
              data: {
                thing2: { value: app.globalData.title },
                id: app.globalData.id,
                label: objData.label
              },
            })
            .then(() => {
              console.log("更新成功")
            })
            .catch(() => {
              console.log("更新失败")
            });
      
            db.collection("items").where({//查询新标签事项数量
              label: objData.label
            }).count().then(res => {
              console.log(res.total)
              app.globalData.num = res.total
              var that = this
              db.collection("labels").where({//查询新标签_id
                label: objData.label
              }).get({
                success: res => {
                  console.log(res.data[0]._id)
                  app.globalData._id = res.data[0]._id;
                  db.collection("labels").doc(app.globalData._id).update({//更新包含新标签的记录数量
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
            db.collection("items").where({//查询原来标签事项数量
              label: app.globalData.label
            }).count().then(res => {
              console.log(res.total)
              app.globalData.prenum = res.total
              db.collection("labels").where({//查询此标签_id
                label: app.globalData.label
              }).get({
                success: res => {
                  console.log(res.data[0]._id)
                  app.globalData.preid = res.data[0]._id;
                  db.collection("labels").doc(app.globalData.preid).update({//更新包含此标签的记录数量
                    data: {
                      num: app.globalData.prenum
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
        },
        fail() {
          console.log("更新失败")
        }
      })
      wx.switchTab({
        url: "/pages/index/index", // 希望跳转过去的页面
      })
    }
  },

  selectlabel: function (e) {
    this.setData({ flag: '0' });
    this.setData({
      disabled: true
    });
    if (getCurrentPages().length != 0) {
      //刷新标签列表
      getCurrentPages()[getCurrentPages().length - 1].onShow()
    } 
  },
  changelabel: function (e) {
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
      showDialog: !this.data.showDialog
    });
    this.setData({ flag: '1' });
  },
  att: function () {//添加附件
    wx.navigateTo({
      url: "/pages/components/attachment/attachment", // 希望跳转过去的页面
    })
  },
  x1: function () {//取消退出
    this.setData({
      showDialog: !this.data.showDialog,
      'inputValue': ''
    });
    this.setData({
      disabled: false
    });
  },
  Submit: function (e) {//确定
    if (!e.detail.value.key) {
      wx.showToast({
        icon: 'none',
        title: '标签为空'
      });
    } else {
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    app.globalData.id = options.id
    if (options) {
      items.doc(options.id).get({
        success: res => {
          console.log(res.data)
          this.setData({
            label: res.data.label, 
            title: res.data.title,
            content: res.data.content,
            item: res.data.pic
          })
          app.globalData.label = res.data.label
          app.globalData.pic = res.data.pic;
        }
      })
    } 
      
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
  }
})

