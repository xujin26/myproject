// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database();

// 云函数入口函数
exports.main = async event => {
  try {
    const {OPENID} = cloud.getWXContext();
    // 删除订阅的消息
    const result = await db
      .collection('messages')
      .where({
        touser: OPENID,
        label: event.label,
      })
      .remove();
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};