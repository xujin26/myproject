// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async event => {
  try {
    const {OPENID} = cloud.getWXContext();
    // 修改订阅的消息
    const result = await db
      .collection('messages')
      .where({
        touser: OPENID,
        id: event.id,
      })
      .update({
        data: {
          label: event.label,
          'data.thing2': event.thing2,
        },
      });
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};
