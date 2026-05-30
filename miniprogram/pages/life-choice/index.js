const app = getApp();

const SCENARIOS = [
  {
    id: 1,
    year: "1968年",
    title: "要不要去当兵？",
    description: "那年爷爷刚满18岁，村里来了征兵通知。去当兵意味着离开家乡好几年，但能学到本事；留在村里，能帮家里干农活，安稳过日子。",
    optionA: "报名参军，出去闯荡",
    optionB: "留在村里，种地养家",
    answer: "A",
    result: "爷爷毅然报名参军了！在部队里他学会了开大卡车，还认识了来自天南海北的战友，这是他这辈子最骄傲的事。",
  },
  {
    id: 2,
    year: "1975年",
    title: "要不要学一门手艺？",
    description: "从部队回来后，村里来了师傅教木工手艺。学手艺要交学费，但学会了就能做家具赚钱；继续种地虽然稳定，但收入少。",
    optionA: "省吃俭用学手艺",
    optionB: "继续种地求安稳",
    answer: "A",
    result: "爷爷拿出退伍费学了木工！后来他打的桌椅板凳远近闻名，靠这门手艺供你爸和叔叔都上了学。",
  },
  {
    id: 3,
    year: "1985年",
    title: "要不要搬到城里？",
    description: "改革开放了，城里到处在招工。搬到城里能多挣钱，孩子们能上好学校；但留在老家，房子宽敞，亲戚邻居互相有照应。",
    optionA: "搬去城里闯一闯",
    optionB: "留在老家，安稳生活",
    answer: "B",
    result: "爷爷选择留在了老家。他说'根在这里，踏实'。他在镇上开了家具店，日子过得红红火火，还把老房子翻修成了小洋楼。",
  },
  {
    id: 4,
    year: "1998年",
    title: "要不要支持孙子学计算机？",
    description: "孙子上高中了，对计算机特别感兴趣，想买一台电脑。但电脑很贵，一台就要大半年的收入。亲戚们都说'学那玩意有啥用'。",
    optionA: "咬咬牙给孙子买电脑",
    optionB: "劝孙子好好学文化课",
    answer: "A",
    result: "爷爷拍了板：'孩子喜欢，就给他买！'后来孙子考上了最好的大学计算机系，成了全家的骄傲。爷爷说这是他最不后悔的决定。",
  },
  {
    id: 5,
    year: "现在",
    title: "最想对晚辈说什么？",
    description: "回望这一生，爷爷经历过许多起起落落，做出了很多重要的选择。如果要给后辈留一句话，你觉得爷爷会说什么？",
    optionA: "勇敢去做，别怕犯错",
    optionB: "平安是福，知足常乐",
    answer: "A",
    result: "爷爷笑着说：'勇敢去做，别怕犯错。你看我这一辈子，最不后悔的就是那些大胆的决定。年轻就是本钱，摔倒了爬起来就是！'",
  },
];

Page({
  data: {
    scenarios: SCENARIOS,
    currentIndex: 0,
    selectedOption: "",
    showResult: false,
    completedIds: [],
    totalCount: SCENARIOS.length,
  },

  onLoad() {
    const progress = app.globalData.gameState.choiceProgress || [];
    const currentIndex = progress.length < SCENARIOS.length ? progress.length : 0;

    this.setData({
      completedIds: progress,
      currentIndex,
    });

    if (currentIndex >= SCENARIOS.length) {
      this.setData({ allDone: true });
    }
  },

  selectOption(e) {
    if (this.data.showResult) return;

    const option = e.currentTarget.dataset.option;
    this.setData({ selectedOption: option, showResult: true });
  },

  nextScenario() {
    const scenario = this.data.scenarios[this.data.currentIndex];
    const completedIds = [...this.data.completedIds, scenario.id];
    const nextIndex = this.data.currentIndex + 1;

    app.globalData.gameState.choiceProgress = completedIds;
    app.saveGameState();

    if (nextIndex >= this.data.totalCount) {
      this.setData({
        completedIds,
        currentIndex: nextIndex,
        selectedOption: "",
        showResult: false,
        allDone: true,
      });
    } else {
      this.setData({
        completedIds,
        currentIndex: nextIndex,
        selectedOption: "",
        showResult: false,
      });
    }
  },

  resetAll() {
    app.globalData.gameState.choiceProgress = [];
    app.saveGameState();
    this.setData({
      currentIndex: 0,
      selectedOption: "",
      showResult: false,
      completedIds: [],
      allDone: false,
    });
  },
});
