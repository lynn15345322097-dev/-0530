const app = getApp();

Page({
  data: {
    exhibits: [],
    unlockedCount: 0,
    totalCount: 0,
    tasks: [],
    showFullscreen: false,
    fullscreenPhoto: null,
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

    this.setData({
      showFullscreen: true,
      fullscreenPhoto: photo,
    });
  },

  closeFullscreen() {
    this.setData({
      showFullscreen: false,
      fullscreenPhoto: null,
    });
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
});
