// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();

// 云函数入口函数
exports.main = async event => {
  try {
    const {OPENID} = cloud.getWXContext();
    const result = await db
      .collection('items')
      .where({
        _openid: OPENID,
        label: event.label,
      })
      .remove();
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};
