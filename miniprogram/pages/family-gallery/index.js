const app = getApp();

Page({
  data: {
    exhibits: [],
    unlockedCount: 0,
    totalCount: 0,
    tasks: [],
    showFullscreen: false,
    fullscreenPhoto: null,
    showUpload: false,
    previewSrc: "",
    uploadTitle: "",
    uploadKeyword: "",
    chosenFile: null,
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const gs = app.globalData.gameState;
    const photos = gs.photos || [];
    const tasks = gs.tasks || [];
    const unlockedCount = photos.filter((p) => p.unlocked).length;

    this.setData({
      exhibits: photos,
      unlockedCount,
      totalCount: photos.length,
      tasks,
    });
  },

  openFullscreen(e) {
    const id = e.currentTarget.dataset.id;
    const photo = this.data.exhibits.find((p) => p.id === id);
    if (!photo || !photo.unlocked) return;
    this.setData({ showFullscreen: true, fullscreenPhoto: photo });
  },

  closeFullscreen() {
    this.setData({ showFullscreen: false, fullscreenPhoto: null });
  },

  toggleTask(e) {
    const id = e.currentTarget.dataset.id;
    const tasks = this.data.tasks.map((t) => {
      if (t.id === id) t.completed = !t.completed;
      return t;
    });
    app.saveTasks(tasks);
    this.setData({ tasks });
  },

  startUpload() {
    this.setData({
      showUpload: true,
      previewSrc: "",
      uploadTitle: "",
      uploadKeyword: "",
      chosenFile: null,
    });
  },

  cancelUpload() {
    this.setData({ showUpload: false });
  },

  pickImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: (res) => {
        this.setData({
          previewSrc: res.tempFiles[0].tempFilePath,
          chosenFile: res.tempFiles[0],
        });
      },
    });
  },

  onTitleInput(e) {
    this.setData({ uploadTitle: e.detail.value });
  },

  onKeywordInput(e) {
    this.setData({ uploadKeyword: e.detail.value });
  },

  async confirmUpload() {
    const { uploadTitle, uploadKeyword, chosenFile } = this.data;

    if (!uploadTitle) {
      wx.showToast({ title: "请输入照片名称", icon: "none" });
      return;
    }
    if (!uploadKeyword) {
      wx.showToast({ title: "请输入关键词", icon: "none" });
      return;
    }
    if (!chosenFile) {
      wx.showToast({ title: "请选择一张照片", icon: "none" });
      return;
    }

    wx.showLoading({ title: "上传中..." });

    try {
      const cloudPath = `photos/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: chosenFile.tempFilePath,
      });

      const addRes = await wx.cloud.callFunction({
        name: "quickstartFunctions",
        data: {
          type: "addPhoto",
          title: uploadTitle,
          keyword: uploadKeyword,
          src: uploadRes.fileID,
        },
      });

      wx.hideLoading();
      wx.showToast({ title: "照片上传成功！", icon: "success" });

      const gs = app.globalData.gameState;
      gs.photos.push({
        id: addRes.result._id,
        title: uploadTitle,
        src: uploadRes.fileID,
        keyword: uploadKeyword,
        unlocked: false,
      });

      this.setData({
        showUpload: false,
        exhibits: gs.photos,
        totalCount: gs.photos.length,
      });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: "上传失败，请重试", icon: "none" });
      console.error(e);
    }
  },
});
