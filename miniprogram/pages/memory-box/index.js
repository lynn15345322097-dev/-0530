const app = getApp();

Page({
  data: {
    photos: [],
    currentIndex: 0,
    isRecording: false,
    isUnlocking: false,
    unlockHint: "",
    showHint: false,
    loading: true,
    waveBars: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  },

  onLoad() {
    this.initRecorder();
    this.waitForReady();
  },

  onShow() {
    if (app.globalData.gameState.ready) {
      this.loadPhotos();
    }
  },

  waitForReady() {
    if (app.globalData.gameState.ready) {
      this.loadPhotos();
      return;
    }
    setTimeout(() => this.waitForReady(), 300);
  },

  loadPhotos() {
    const photos = app.globalData.gameState.photos;
    this.setData({ photos, loading: photos.length === 0 });
  },

  initRecorder() {
    this.recorder = wx.getRecorderManager();

    // 实时音频帧 → 驱动波形动画
    this.recorder.onFrameRecorded((res) => {
      const data = new Uint8Array(res.frameBuffer);
      let sum = 0;
      const step = Math.max(1, Math.floor(data.length / 12));
      const bars = [];
      for (let i = 0; i < 12; i++) {
        const val = data[i * step] || 128;
        const level = Math.abs(val - 128) * 0.6;
        bars.push(Math.max(8, Math.min(80, level)));
      }
      this.setData({ waveBars: bars });
    });

    this.recorder.onStop((res) => {
      this.setData({ isRecording: false, waveBars: [10,10,10,10,10,10,10,10,10,10,10,10] });
      this.uploadRecording(res);
      this.doRecognition(res);
    });

    this.recorder.onError(() => {
      this.setData({ isRecording: false });
      wx.showToast({ title: "录音失败，请再试一次", icon: "none" });
    });
  },

  onTouchStart() {
    if (this.data.isUnlocking) return;
    const photo = this.data.photos[this.data.currentIndex];
    if (photo.unlocked) return;

    this.setData({ isRecording: true });
    this.recorder.start({
      duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: "mp3",
      frameSize: 10,
    });
  },

  onTouchEnd() {
    if (!this.data.isRecording) return;
    this.recorder.stop();
  },

  uploadRecording(res) {
    const photo = this.data.photos[this.data.currentIndex];
    const filePath = res.tempFilePath;
    if (!filePath) return;

    wx.cloud.uploadFile({
      cloudPath: `voices/${photo.id}_${Date.now()}.mp3`,
      filePath: filePath,
    }).catch(() => {});
  },

  doRecognition(res) {
    const photo = this.data.photos[this.data.currentIndex];
    if (photo.unlocked) return;

    // 将录音文件发送到云函数做语音识别
    if (res.tempFilePath) {
      wx.cloud.callFunction({
        name: "quickstartFunctions",
        data: {
          type: "speechToText",
          filePath: res.tempFilePath,
          keyword: photo.keyword,
        },
      }).then((result) => {
        if (result.result && result.result.matched) {
          this.unlockPhoto();
        } else {
          this.setData({
            unlockHint: result.result.transcript
              ? `您说"${result.result.transcript}"，再试试吧~`
              : "再试试哦，说说您印象中的画面吧~",
            showHint: true,
          });
          setTimeout(() => this.setData({ showHint: false }), 2500);
        }
      }).catch(() => {
        // 云端识别不可用时本地模拟
        this.simulateLocal();
      });
    } else {
      this.simulateLocal();
    }
  },

  simulateLocal() {
    const photo = this.data.photos[this.data.currentIndex];
    const hit = Math.random() < 0.4;
    if (hit) {
      this.unlockPhoto();
    } else {
      this.setData({
        unlockHint: "再试试哦，说说您印象中的画面吧~",
        showHint: true,
      });
      setTimeout(() => this.setData({ showHint: false }), 2500);
    }
  },

  async unlockPhoto() {
    const photos = this.data.photos;
    const photo = photos[this.data.currentIndex];

    this.setData({ isUnlocking: true });

    setTimeout(async () => {
      photo.unlocked = true;
      await app.saveUnlockedPhoto(photo.id);

      this.setData({
        photos: app.globalData.gameState.photos,
        isUnlocking: false,
        unlockHint: "太棒了！记忆被唤醒啦~",
        showHint: true,
      });

      setTimeout(() => this.setData({ showHint: false }), 2500);
    }, 400);
  },

  prevPhoto() {
    if (this.data.isRecording || this.data.isUnlocking) return;
    if (this.data.currentIndex > 0) {
      this.setData({ currentIndex: this.data.currentIndex - 1, unlockHint: "", showHint: false });
    }
  },

  nextPhoto() {
    if (this.data.isRecording || this.data.isUnlocking) return;
    if (this.data.currentIndex < this.data.photos.length - 1) {
      this.setData({ currentIndex: this.data.currentIndex + 1, unlockHint: "", showHint: false });
    }
  },

  onTouchStartSwipe(e) {
    this._touchX = e.touches[0].clientX;
    this._touchY = e.touches[0].clientY;
  },

  onTouchEndSwipe(e) {
    if (this.data.isRecording || this.data.isUnlocking) return;
    if (this._touchX == null) return;
    const dx = e.changedTouches[0].clientX - this._touchX;
    const dy = e.changedTouches[0].clientY - this._touchY;
    this._touchX = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) this.nextPhoto();
    else this.prevPhoto();
  },
});
