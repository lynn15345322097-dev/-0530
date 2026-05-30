const app = getApp();

Page({
  data: {
    scenarios: [],
    currentIndex: 0,
    selectedOption: "",
    showResult: false,
    completedIds: [],
    totalCount: 0,
    allDone: false,
    loading: true,
  },

  onLoad() {
    this.waitForReady();
  },

  waitForReady() {
    if (app.globalData.gameState.ready) {
      this.init();
      return;
    }
    setTimeout(() => this.waitForReady(), 300);
  },

  init() {
    const gs = app.globalData.gameState;
    const scenarios = gs.scenarios;
    const completedIds = gs.completedScenarioIds || [];
    const currentIndex = completedIds.length < scenarios.length ? completedIds.length : 0;

    this.setData({
      scenarios,
      completedIds,
      currentIndex,
      totalCount: scenarios.length,
      allDone: currentIndex >= scenarios.length && scenarios.length > 0,
      loading: scenarios.length === 0,
    });
  },

  selectOption(e) {
    if (this.data.showResult) return;
    const option = e.currentTarget.dataset.option;
    this.setData({ selectedOption: option, showResult: true });
  },

  async nextScenario() {
    const scenario = this.data.scenarios[this.data.currentIndex];
    const completedIds = [...this.data.completedIds, scenario.id];
    const nextIndex = this.data.currentIndex + 1;

    await app.saveCompletedScenario(scenario.id);

    if (nextIndex >= this.data.totalCount) {
      this.setData({
        completedIds: app.globalData.gameState.completedScenarioIds,
        currentIndex: nextIndex,
        selectedOption: "",
        showResult: false,
        allDone: true,
      });
    } else {
      this.setData({
        completedIds: app.globalData.gameState.completedScenarioIds,
        currentIndex: nextIndex,
        selectedOption: "",
        showResult: false,
      });
    }
  },

  async resetAll() {
    app.globalData.gameState.completedScenarioIds = [];
    await wx.cloud.callFunction({
      name: "quickstartFunctions",
      data: {
        type: "updateUserProgress",
        _id: app.globalData.gameState._progressId,
        field: "completedScenarioIds",
        value: [],
      },
    });
    this.setData({
      currentIndex: 0,
      selectedOption: "",
      showResult: false,
      completedIds: [],
      allDone: false,
    });
  },
});
