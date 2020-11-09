// pages/module/module.js
const app = getApp()
const db = wx.cloud.database();//初始化数据库
const items = db.collection('items')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imagesList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    items.field({
      pic: true
    }).get({
      success: res => {
        console.log(res.data)
        var result = [];
        var that = this
        console.log(res.data.length)
        for(var i=0;i<res.data.length;i++){
          if(res.data[i].pic){
            for(var j=0; j<res.data[i].pic.length;j++){
              wx.cloud.downloadFile({
                fileID: res.data[i].pic[j],//转换成临时路径
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
        }
      }
    })
  },
  previewImage: function (e) {//预览
    var current = e.target.dataset.src;
    console.log(current)
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: this.data.imagesList, // 需要预览的图片http链接列表  
    })
    console.log(this.data)
  }
})