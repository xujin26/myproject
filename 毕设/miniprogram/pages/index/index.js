//index.js
const app = getApp()
const db = wx.cloud.database()
const items = db.collection('items')
const labels = db.collection('labels')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModalStatus: false,
    hasEmptyGrid: false,
    cur_year: '',
    cur_month: '',
    itemsList: [],
    showDialog: false,
    selected: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setNowDate();
    if (app.globalData.isLogin) {
      var that = this
      items.where({
        day: app.globalData.day
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
  },
  cre: function () {
    if(!app.globalData.isLogin){
      wx.showToast({
        title: '请先登录！',
        icon: 'none',
        duration: 1000//持续的时间
      })
    }else{
      app.globalData.pic = "";
      app.globalData.fileID = "";
      wx.navigateTo({
        url: "/pages/add/add", // 希望跳转过去的页面
      })
    }
  },
  slectitem: function (e) {//进入详情页面
    let index = e.currentTarget.dataset.index;
    console.log(e.currentTarget.dataset.index);
    wx.navigateTo({
      url: '/pages/detail/detail?index=' + index,
    })
  },
  cal: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    console.log(currentStatu)//open、close
    this.util(currentStatu);//动画
    if (app.globalData.isLogin) {
      var that = this
      items.where({
        day: app.globalData.day
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
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例  
    var animation = wx.createAnimation({
      duration: 200, //动画时长 
      timingFunction: "linear", //线性 
      delay: 0 //0则不延迟 
    });

    // 第2步：这个动画实例赋给当前的动画实例 
    this.animation = animation;

    // 第3步：执行第一组动画 
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存 
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      })
      //关闭 
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)
    // 显示 
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
  },
  dateSelectAction: function (e) {//日期的选择
    var cur_day = e.currentTarget.dataset.idx;
    console.log(cur_day);
    this.setData({
      todayIndex: cur_day
    })
    var cur_day = cur_day + 1;//index数组下标比日期少1
    var Y = this.data.cur_year;//年
    var M = (this.data.cur_month < 10 ? '0' + (this.data.cur_month) : this.data.cur_month.toString());//月
    var D = cur_day < 10 ? '0' + cur_day : cur_day;//日
    console.log(`点击的日期:${this.data.cur_year}年${this.data.cur_month}月${cur_day}日`);
    app.globalData.day = (+ Y + M + D);
    this.setData({
      cur_day: cur_day
    })
  },

  setNowDate: function () {//设置当前时间
    const date = new Date();
    const cur_year = date.getFullYear();
    const cur_month = date.getMonth() + 1;
    const todayIndex = date.getDate() - 1;
    const cur_day = date.getDate();
    var Y = date.getFullYear();//年
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);//月
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();//日
    
    console.log("当前时间：" + cur_year + cur_month + cur_day);
    //console.log(`日期：${cur_year}${cur_month}${cur_day}`)
    app.globalData.day = (+ Y + M + D);
    const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
    this.calculateEmptyGrids(cur_year, cur_month);
    this.calculateDays(cur_year, cur_month);
    this.setData({
      cur_year: cur_year,
      cur_month: cur_month,
      cur_day: cur_day,
      weeks_ch,
      todayIndex,
    })
  },

  getThisMonthDays(year, month) {//获得月份天数
    return new Date(year, month, 0).getDate();
  },
  getFirstDayOfWeek(year, month) {//第一天是周几
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },
  calculateEmptyGrids(year, month) {//页面日期的布局
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
    let empytGrids = [];//空白格
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        empytGrids.push(i);
      }
      this.setData({
        hasEmptyGrid: true,
        empytGrids
      });
    } else {
      this.setData({
        hasEmptyGrid: false,
        empytGrids: []
      });
    }
  },
  calculateDays(year, month) {
    let days = [];
    const thisMonthDays = this.getThisMonthDays(year, month);//获得月份天数
    for (let i = 1; i <= thisMonthDays; i++) {
      days.push(i);
    }
    this.setData({
      days
    });
  },
  handleCalendar(e) {//选择日期
    const handle = e.currentTarget.dataset.handle;
    const cur_year = this.data.cur_year;
    const cur_month = this.data.cur_month;
    if (handle === 'prev') {
      let newMonth = cur_month - 1;
      let newYear = cur_year;
      if (newMonth < 1) {
        newYear = cur_year - 1;
        newMonth = 12;
      }
      this.calculateDays(newYear, newMonth);//每个月份天数不同
      this.calculateEmptyGrids(newYear, newMonth);//改变页面日期布局
      this.setData({
        cur_year: newYear,
        cur_month: newMonth
      })
    } else {
      let newMonth = cur_month + 1;
      let newYear = cur_year;
      if (newMonth > 12) {
        newYear = cur_year + 1;
        newMonth = 1;
      }
      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);
      this.setData({
        cur_year: newYear,
        cur_month: newMonth
      })
    }
    console.log(`点击的日期:${this.data.cur_year}年${this.data.cur_month}月${this.data.cur_day}日`);
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(app.globalData.show){
      //console.log(app.globalData.show);
      this.setNowDate();
      app.globalData.show = false;
    }
    app.globalData.ida = "";
    this.setData({
      selected: false
    });
    //this.setNowDate();//设置为当前时间
    if (app.globalData.isLogin) {
      var that = this
      items.where({
        day: app.globalData.day
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
  },
  checkboxChange: function (e) {
    console.log(e);
    console.log(e.detail.value);
    app.globalData.ida = e.detail.value[0];
  },
  del: function (e) {
    if(!app.globalData.isLogin){
      wx.showToast({
        title: '请先登录！',
        icon: 'none',
        duration: 1000//持续的时间
      })
    }else if(!app.globalData.ida){
      wx.showToast({
        title: '请选择记录！',
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
    });
  },
  x2: function () {//确认删除
    console.log(app.globalData.ida)
    this.setData({
      selected: false
    });
    //取消订阅
    wx.cloud
    .callFunction({
      name: 'unsubscribe',
      data: {
        id: app.globalData.ida,
      },
    })
    .then(() => {
      console.log("取消订阅成功")
    })
    .catch(() => {
    console.log("取消订阅失败")
    });

    items.doc(app.globalData.ida).get({
      success: res => {
        app.globalData.tab = res.data.label;
        console.log(app.globalData.tab)
        items.doc(app.globalData.ida).remove({
          success: function (res) {
            console.log("删除成功");  
            
            app.globalData.ida = "";
            
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
                      console.log(res);
                    },
                    fail() {
                      console.log("更新失败")
                    }
                  })
                }
              })
            })

            if (getCurrentPages().length != 0) {
              //刷新当前页面的数据
              getCurrentPages()[getCurrentPages().length - 1].onShow()
            }
          }
        })
      }
    })
    this.setData({
      showDialog: !this.data.showDialog,
    });
  }
})