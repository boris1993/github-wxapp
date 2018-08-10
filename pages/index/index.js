// pages/main/main.js
const app = getApp();
const base64util = require('../../utils/base64.js');
const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // Navbar
    tabs: ["动态", "主页", "资料"],
    activeIndex: 1,
    sliderOffset: 0,
    sliderLeft: 0,
    loginCredential: "",
    windowHeight: 0,
    navbarHeight: 0,
    headerHeight: 0,
    scrollViewHeight: 0,
    notifications: {
      loadingUserInfo: '正在加载...'
    },
    githubUser: {
      public_repos: "--",
      followers: "--",
      following: "--"
    },
    repos: {},
    isReposFetched: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowHeight: res.windowHeight,
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });

    // Set login credential
    var credential = '';
    if (app.globalData.credential.loginMethod === 'Basic') {
      credential = base64util.base64_encode(
        app.globalData.credential.username +
        ':' +
        app.globalData.credential.credential);
    } else {
      credential = app.globalData.credential.credential;
    }
    this.setData({
      loginCredential: credential
    });

    // Calculate the height of the scroll view
    let query = wx.createSelectorQuery().in(that);
    query.select('.weui-navbar').boundingClientRect();
    query.select('#overview-info').boundingClientRect();

    query.exec((res) => {
      let navbarHeight = res[0].height;
      let headerHeight = res[1].height;

      let scrollViewHeight = this.data.windowHeight - navbarHeight - headerHeight;

      this.setData({
        scrollViewHeight: scrollViewHeight
      });
    });

    // Initialize everything
    this.initialize(that);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    return app.globalData.sharing;
  },
  /**
   * When changing tab
   */
  tabClick: function(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  /**
   * Preview avatar when touched
   */
  previewAvatar: function() {
    wx.previewImage({
      urls: [this.data.githubUser.avatar_url],
    })
  },
  /**
   * Initialize
   */
  initialize: (that) => {
    that.getGitHubUserInfo(that)
      .then(() => {
        // Fetch a list of repositories
        return that.getRepositories(that);
      })
      .catch(() => {
        wx.showModal({
          title: app.globalData.modalTitles.error,
          content: app.globalData.notifications.networkError,
          showCancel: false
        });
      });
  },
  /**
   * Refresh when pull down
   */
  onPullDownRefresh: function() {
    let that = this;
    if (this.data.activeIndex === 0) {

    } else if (this.data.activeIndex === 1) {
      this.initialize(that);
    } else if (this.data.activeIndex === 2) {

    }
    wx.stopPullDownRefresh();
  },
  /**
   * Get GitHub user info
   */
  getGitHubUserInfo: (that) => {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: that.data.notifications.loadingUserInfo
      })

      wx.request({
        url: 'https://api.github.com/user',
        header: {
          'Authorization': app.globalData.credential.loginMethod + ' ' +
            that.data.loginCredential,
          'Accept': 'application / vnd.github.v3 + json'
        },
        success: resp => {
          that.setData({
            githubUser: resp.data
          });
          wx.hideLoading();
          return resolve();
        },
        fail: () => {
          wx.hideLoading();
          reject()
        }
      });
    })
  },
  /**
   * Get repositories
   */
  getRepositories: (that) => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: that.data.githubUser.repos_url,
        header: {
          'Authorization': app.globalData.credential.loginMethod + ' ' +
            that.data.loginCredential,
          'Accept': 'application / vnd.github.v3 + json'
        },
        success: resp => {
          that.setData({
            repos: resp.data,
            isReposFetched: true
          });
          return resolve();
        },
        fail: () => {
          reject();
        }
      });
    });
  }
})