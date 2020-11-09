const cloud = require('wx-server-sdk');

exports.main = async (event, context) => {
  cloud.init();
  const db = cloud.database();
  const _ =db.command

  try {
    // 从云开数据库中查询等待发送的消息列表
    const messages = await db//异步
      .collection('messages')
      .where({
        done: false,
        // 到期前5分钟之内
        startTime: _.gte(new Date().getTime()).and(_.lte(new Date().getTime() + 5 * 60 * 1000)),
      })
      .get({
      success: res => {
        console.log(res.data)
      }
    });

    // 循环消息列表
    const sendPromises = messages.data.map(async message => {
      try {
        // 发送订阅消息
        await cloud.openapi.subscribeMessage.send({
          touser: message.touser,
          page: message.page,
          data: message.data,
          templateId: message.templateId,
        });
        // 发送成功后将消息的状态改为已发送
        return db
          .collection('messages')
          .doc(message._id)
          .update({
            data: {
              done: true,
            },
          });
      } catch (e) {
        return e;
      }
    });

    return Promise.all(sendPromises);//并发
  } catch (err) {
    console.log(err);
    return err;
  }
};
