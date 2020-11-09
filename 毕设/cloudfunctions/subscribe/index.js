const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event) => {
  //console.log("订阅消息")
  try {
    const {OPENID} = cloud.getWXContext();

    // 在云开发数据库中存储用户订阅的信息
    const result = await db.collection('messages').add({
      data: {
        templateId: event.templateId,//订阅消息模板ID
        touser: OPENID,//订阅者的openid
        data: event.data,//订阅消息的数据
        page: 'index',//订阅消息卡片点击后会打开小程序的哪个页面
        done: false, // 消息发送状态设置为 false
        startTime: event.startTime,
        id: event.id,
        label: event.label,
      },
    });
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};
