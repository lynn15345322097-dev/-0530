App({
  onLaunch: function () {
    this.globalData = {
      env: "cloud1-d1gu81ybt058fbbc3",
      gameState: {
        photos: [],
        scenarios: [],
        unlockedPhotoIds: [],
        completedScenarioIds: [],
        tasks: [],
        openid: "",
        ready: false,
      },
    };

    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
      return;
    }

    wx.cloud.init({
      env: this.globalData.env,
      traceUser: true,
    });

    this.initCloudData();
  },

  async initCloudData() {
    try {
      await this.loadOpenId();
      await Promise.all([
        this.loadPhotosFromCloud(),
        this.loadScenariosFromCloud(),
        this.loadUserProgress(),
      ]);
      this.globalData.gameState.ready = true;
    } catch (e) {
      console.error("云端数据加载失败，使用本地缓存", e);
      this.fallbackToLocal();
    }
  },

  loadOpenId() {
    return wx.cloud.callFunction({
      name: "quickstartFunctions",
      data: { type: "getOpenId" },
    }).then((res) => {
      this.globalData.gameState.openid = res.result.openid;
    });
  },

  loadPhotosFromCloud() {
    const MAX_LIMIT = 20;
    return wx.cloud.database().collection("photos")
      .orderBy("sortOrder", "asc")
      .limit(MAX_LIMIT)
      .get()
      .then((res) => {
        const photos = res.data.map((p) => ({
          id: p._id,
          src: p.src,
          title: p.title,
          keyword: p.keyword,
          unlocked: false,
        }));
        this.globalData.gameState.photos = photos;
        wx.setStorageSync("cached_photos", photos);
      });
  },

  loadScenariosFromCloud() {
    const MAX_LIMIT = 20;
    return wx.cloud.database().collection("scenarios")
      .orderBy("sortOrder", "asc")
      .limit(MAX_LIMIT)
      .get()
      .then((res) => {
        const scenarios = res.data.map((s) => ({
          id: s._id,
          year: s.year,
          title: s.title,
          description: s.description,
          optionA: s.optionA,
          optionB: s.optionB,
          answer: s.answer,
          result: s.result,
        }));
        this.globalData.gameState.scenarios = scenarios;
        wx.setStorageSync("cached_scenarios", scenarios);
      });
  },

  loadUserProgress() {
    const db = wx.cloud.database();
    return db.collection("user_progress")
      .where({ _openid: this.globalData.gameState.openid })
      .get()
      .then((res) => {
        if (res.data.length > 0) {
          const doc = res.data[0];
          this.globalData.gameState.unlockedPhotoIds = doc.unlockedPhotoIds || [];
          this.globalData.gameState.completedScenarioIds = doc.completedScenarioIds || [];
          this.globalData.gameState.tasks = doc.tasks || this.defaultTasks();
          this.globalData.gameState._progressId = doc._id;
        } else {
          this.globalData.gameState.tasks = this.defaultTasks();
          this.createUserProgress();
        }
        this.syncPhotosUnlockState();
      })
      .catch(() => {
        this.globalData.gameState.tasks = this.defaultTasks();
        this.createUserProgress();
      });
  },

  createUserProgress() {
    wx.cloud.callFunction({
      name: "quickstartFunctions",
      data: {
        type: "createUserProgress",
        tasks: this.globalData.gameState.tasks,
      },
    }).then((res) => {
      if (res.result && res.result._id) {
        this.globalData.gameState._progressId = res.result._id;
      }
    });
  },

  syncPhotosUnlockState() {
    const ids = this.globalData.gameState.unlockedPhotoIds;
    this.globalData.gameState.photos.forEach((p) => {
      if (ids.includes(p.id)) p.unlocked = true;
    });
  },

  saveUnlockedPhoto(photoId) {
    const gs = this.globalData.gameState;
    if (!gs.unlockedPhotoIds.includes(photoId)) {
      gs.unlockedPhotoIds.push(photoId);
    }
    this.syncPhotosUnlockState();
    return wx.cloud.callFunction({
      name: "quickstartFunctions",
      data: {
        type: "updateUserProgress",
        _id: gs._progressId,
        field: "unlockedPhotoIds",
        value: gs.unlockedPhotoIds,
      },
    });
  },

  saveCompletedScenario(scenarioId) {
    const gs = this.globalData.gameState;
    if (!gs.completedScenarioIds.includes(scenarioId)) {
      gs.completedScenarioIds.push(scenarioId);
    }
    return wx.cloud.callFunction({
      name: "quickstartFunctions",
      data: {
        type: "updateUserProgress",
        _id: gs._progressId,
        field: "completedScenarioIds",
        value: gs.completedScenarioIds,
      },
    });
  },

  saveTasks(tasks) {
    this.globalData.gameState.tasks = tasks;
    return wx.cloud.callFunction({
      name: "quickstartFunctions",
      data: {
        type: "updateUserProgress",
        _id: this.globalData.gameState._progressId,
        field: "tasks",
        value: tasks,
      },
    });
  },

  fallbackToLocal() {
    const gs = this.globalData.gameState;
    gs.photos = wx.getStorageSync("cached_photos") || this.hardcodedPhotos();
    gs.scenarios = wx.getStorageSync("cached_scenarios") || [];
    gs.unlockedPhotoIds = wx.getStorageSync("local_unlocked") || [];
    gs.completedScenarioIds = wx.getStorageSync("life_choice_progress") || [];
    gs.tasks = wx.getStorageSync("family_tasks") || this.defaultTasks();
    gs.ready = true;
    this.syncPhotosUnlockState();
  },

  hardcodedPhotos() {
    return [
      { id: "local_1", src: "https://picsum.photos/seed/1960yard/600/800", title: "老家的院子", keyword: "院子", unlocked: false },
      { id: "local_2", src: "https://picsum.photos/seed/1970wedding/600/800", title: "爸妈的结婚照", keyword: "结婚", unlocked: false },
      { id: "local_3", src: "https://picsum.photos/seed/1980school/600/800", title: "小时候的学校", keyword: "学校", unlocked: false },
      { id: "local_4", src: "https://picsum.photos/seed/1990family/600/800", title: "全家福合照", keyword: "全家福", unlocked: false },
      { id: "local_5", src: "https://picsum.photos/seed/2000travel/600/800", title: "第一次旅行", keyword: "旅行", unlocked: false },
    ];
  },

  defaultTasks() {
    return [
      { id: 1, title: "问问奶奶年轻时的故事", completed: false, reward: "解锁隐藏照片" },
      { id: 2, title: "翻翻家里的老相册", completed: false, reward: "线索+1" },
      { id: 3, title: "给爷爷录一段话", completed: false, reward: "新照片解锁" },
    ];
  },
});
