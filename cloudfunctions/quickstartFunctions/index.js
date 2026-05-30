const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 获取openid
const getOpenId = async () => {
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};

// 获取小程序二维码
const getMiniProgramCode = async () => {
  const resp = await cloud.openapi.wxacode.get({ path: "pages/index/index" });
  const { buffer } = resp;
  const upload = await cloud.uploadFile({
    cloudPath: "code.png",
    fileContent: buffer,
  });
  return upload.fileID;
};

// 创建集合
const createCollection = async () => {
  try {
    await db.createCollection("sales");
    await db.collection("sales").add({ data: { region: "华东", city: "上海", sales: 11 } });
    await db.collection("sales").add({ data: { region: "华东", city: "南京", sales: 11 } });
    await db.collection("sales").add({ data: { region: "华南", city: "广州", sales: 22 } });
    await db.collection("sales").add({ data: { region: "华南", city: "深圳", sales: 22 } });
    return { success: true };
  } catch (e) {
    return { success: true, data: "create collection success" };
  }
};

const selectRecord = async () => {
  return await db.collection("sales").get();
};

const updateRecord = async (event) => {
  try {
    for (let i = 0; i < event.data.length; i++) {
      await db.collection("sales").where({ _id: event.data[i]._id }).update({
        data: { sales: event.data[i].sales },
      });
    }
    return { success: true, data: event.data };
  } catch (e) {
    return { success: false, errMsg: e };
  }
};

const insertRecord = async (event) => {
  try {
    await db.collection("sales").add({
      data: {
        region: event.data.region,
        city: event.data.city,
        sales: Number(event.data.sales),
      },
    });
    return { success: true, data: event.data };
  } catch (e) {
    return { success: false, errMsg: e };
  }
};

const deleteRecord = async (event) => {
  try {
    await db.collection("sales").where({ _id: event.data._id }).remove();
    return { success: true };
  } catch (e) {
    return { success: false, errMsg: e };
  }
};

const createUserProgress = async (event) => {
  const wxContext = cloud.getWXContext();
  const doc = {
    _openid: wxContext.OPENID,
    unlockedPhotoIds: [],
    completedScenarioIds: [],
    tasks: event.tasks || [],
    createdAt: new Date(),
  };
  const res = await db.collection("user_progress").add({ data: doc });
  return { _id: res._id };
};

const updateUserProgress = async (event) => {
  const wxContext = cloud.getWXContext();
  const where = event._id ? { _id: event._id } : { _openid: wxContext.OPENID };
  await db.collection("user_progress").where(where).update({
    data: { [event.field]: event.value },
  });
  return { success: true };
};

// 语音识别（模拟匹配 + 音频存档）
const speechToText = async (event) => {
  const { keyword } = event;
  // 生产环境可替换为腾讯云 ASR 接口调用
  const hit = Math.random() < 0.4;
  return {
    matched: hit,
    transcript: hit ? keyword : "",
  };
};

// 新增照片（用户上传）
const addPhoto = async (event) => {
  const { title, keyword, src } = event;
  const count = await db.collection("photos").count();
  const res = await db.collection("photos").add({
    data: {
      title,
      src,
      keyword,
      sortOrder: count.total + 1,
      createdAt: new Date(),
    },
  });
  return { _id: res._id };
};

exports.main = async (event, context) => {
  switch (event.type) {
    case "getOpenId": return await getOpenId();
    case "getMiniProgramCode": return await getMiniProgramCode();
    case "createCollection": return await createCollection();
    case "selectRecord": return await selectRecord();
    case "updateRecord": return await updateRecord(event);
    case "insertRecord": return await insertRecord(event);
    case "deleteRecord": return await deleteRecord(event);
    case "createUserProgress": return await createUserProgress(event);
    case "updateUserProgress": return await updateUserProgress(event);
    case "speechToText": return await speechToText(event);
    case "addPhoto": return await addPhoto(event);
    default: return { error: "unknown type" };
  }
};
