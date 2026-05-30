App({
  onLaunch: function () {
    this.globalData = {
      env: "",
      gameState: {
        photos: this.loadPhotos(),
        choiceProgress: wx.getStorageSync("life_choice_progress") || [],
        tasks: wx.getStorageSync("family_tasks") || this.defaultTasks(),
      },
    };

    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
  },

  loadPhotos() {
    const stored = wx.getStorageSync("memory_box_photos");
    if (stored && stored.length) return stored;
    return [
      { id: 1, src: "https://picsum.photos/seed/1960yard/600/800", title: "老家的院子", keyword: "院子", unlocked: false },
      { id: 2, src: "https://picsum.photos/seed/1970wedding/600/800", title: "爸妈的结婚照", keyword: "结婚", unlocked: false },
      { id: 3, src: "https://picsum.photos/seed/1980school/600/800", title: "小时候的学校", keyword: "学校", unlocked: false },
      { id: 4, src: "https://picsum.photos/seed/1990family/600/800", title: "全家福合照", keyword: "全家福", unlocked: false },
      { id: 5, src: "https://picsum.photos/seed/2000travel/600/800", title: "第一次旅行", keyword: "旅行", unlocked: false },
    ];
  },

  defaultTasks() {
    return [
      { id: 1, title: "问问奶奶年轻时的故事", completed: false, reward: "解锁隐藏照片" },
      { id: 2, title: "翻翻家里的老相册", completed: false, reward: "线索+1" },
      { id: 3, title: "给爷爷录一段话", completed: false, reward: "新照片解锁" },
    ];
  },

  saveGameState() {
    const gs = this.globalData.gameState;
    wx.setStorageSync("memory_box_photos", gs.photos);
    wx.setStorageSync("life_choice_progress", gs.choiceProgress);
    wx.setStorageSync("family_tasks", gs.tasks);
  },
});
