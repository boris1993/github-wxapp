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
    notifications: {
      loadingUserInfo: '正在加载...'
    },
    githubUser: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });

    // Get user information
    this.getGitHubUserInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  /**
   * When changing tab
   */
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  /**
   * Get GitHub user info
   */
  getGitHubUserInfo: function () {
    wx.showLoading({
      title: this.data.notifications.loadingUserInfo
    })

    var credential = '';
    if (app.globalData.credential.loginMethod === 'Basic') {
      credential = base64util.base64_encode(
        app.globalData.credential.username 
        + ':' 
        + app.globalData.credential.credential);
    } else {
      credential = app.globalData.credential.credential;
    }
    wx.request({
      url: 'https://api.github.com/user',
      header: {
        'Authorization': app.globalData.credential.loginMethod + ' ' + credential,
        'Accept': 'application / vnd.github.v3 + json'
      },
      success: resp => {
        this.setData({
          githubUser: resp.data
        });
        wx.hideLoading();
      }
    });
  },
  /**
   * Preview avatar when touched
   */
  previewAvatar: function() {
    wx.previewImage({
      urls: [this.data.githubUser.avatar_url],
    })
  }
})