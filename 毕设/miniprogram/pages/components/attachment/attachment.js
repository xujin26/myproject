// pages/components/attachment/attachment.js
const app = getApp()
const db = wx.cloud.database();//初始化数据库
const items = db.collection('items')
Page({
  /**
    * 页面的初始数据
    */
  data: {
    imgbox: [],//选择图片
    fileIDs: [],//上传云存储后的返回值
  },
  onLoad: function (e) {
    if(app.globalData.pic){//编辑事项时，图片存在
      var result = [];
      var that = this
      for(var i=0; i<app.globalData.pic.length;i++){
        wx.cloud.downloadFile({//获得图片临时地址，push进数组
          fileID: app.globalData.pic[i],
          success:res => {
            console.log(res.tempFilePath)
            result.push(res.tempFilePath)
            console.log(result)
            that.setData({
              imgbox: result,
            })
          }
        })
      }
      app.globalData.fileID = app.globalData.pic
    }else
    if(app.globalData.fileID){//上传完图片，再次打开附件管理页面
      var result = [];
      var that = this
      for(var i=0; i<app.globalData.fileID.length;i++){
        wx.cloud.downloadFile({
          fileID: app.globalData.fileID[i],
          success:res => {
            console.log(res.tempFilePath)
            result.push(res.tempFilePath)
            console.log(result)
            that.setData({
              imgbox: result,
            })
          }
        })
      }
    }
  },
  // 删除照片 &&
  imgDelete: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.deindex;//默认数组的当前项的下标变量名默认为 index
    console.log(index)
    let imgbox = this.data.imgbox;
    console.log(imgbox)
    imgbox.splice(index, 1)//从数组中删除,index删除项目位置,要删除的项目数量为1
    that.setData({
      imgbox: imgbox
    });
  },
  // 选择图片 &&&
  addPic1: function (e) {
    var imgbox = this.data.imgbox;//地址数组
    console.log(imgbox)
    var that = this;
    var n = 6;
    if (0 < imgbox.length < 6) {
      n = 6 - imgbox.length;
    } else if (imgbox.length == 6) {
      n = 1;
    }
    wx.chooseImage({
      count: n, // 默认9，设置图片张数
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        if (imgbox.length == 0) {
          imgbox = tempFilePaths
        } else if (imgbox.length < 6) {
          imgbox = imgbox.concat(tempFilePaths);//连接两个或多个数组
        }
        that.setData({
          imgbox: imgbox
        });
      }
    })
  },


  //发布按钮
  fb: function (e) {
    if (!this.data.imgbox.length) {
      wx.showToast({
        icon: 'none',
        title: '图片类容为空',
        duration: 1000
      });
    } else {
      //上传图片到云存储
      let promiseArr = [];
      var fileID = [];
      for (let i = 0; i < this.data.imgbox.length; i++) {
        promiseArr.push(new Promise((reslove, reject) => {
          let item = this.data.imgbox[i];
          let suffix = /\.\w+$/.exec(item)[0];//正则表达式返回文件的扩展名
          wx.cloud.uploadFile({
            cloudPath: new Date().getTime() + suffix, // 上传至云端的路径
            filePath: item, // 小程序临时文件路径
            success: res => {
              this.setData({
                fileIDs: this.data.fileIDs.concat(res.fileID)//加入到数组中
              });
              console.log(res.fileID)//输出上传后图片的云存储地址
              fileID[i] = res.fileID
              reslove();
              wx.hideLoading();
              wx.showToast({
                title: "上传成功",
              })
            },
            fail: res => {
              wx.hideLoading();
              wx.showToast({
                title: "上传失败",
              })
            }
          })
        }));
        app.globalData.fileID = fileID//全局数据
        app.globalData.pic = ''
      }
    }
    //返回父页面
    wx.navigateBack({
      delta: 1,
    })
  },
})