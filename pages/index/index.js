// pages/main/main.js
const app = getApp();
const base64util = require('../../utils/base64.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // Navbar
    tabs: ["动态", "主页", "资料"],
    activeIndex: 1,
    loginCredential: "",
    windowHeight: 0,
    navbarHeight: 0,
    headerHeight: 0,
    scrollViewHeight: 21, // See the scroll-view part in overview.wxml
    notifications: {
      loadingUserInfo: '正在加载...'
    },
    githubUser: {
      public_repos: "--",
      followers: "--",
      following: "--"
    },
    repos: {},
    reposPage: 1,
    reposPerPage: 10,
    isReposFetched: false,
    isReposFetching: false,
    isAllReposFetched: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowHeight: res.windowHeight
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
    let that = this;
    if (this.data.activeIndex === 0) {

    } else if (this.data.activeIndex === 1) {
      this.initialize(that);
    } else if (this.data.activeIndex === 2) {

    }
    wx.stopPullDownRefresh();
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
    that.setData({
      repos: {},
      reposPage: 1,
      isAllReposFetched: false
    });
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
   * Get GitHub user info
   */
  getGitHubUserInfo: (that) => {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: that.data.notifications.loadingUserInfo,
        mask: true
      });

      wx.request({
        url: app.globalData.urls.apiAddress + '/user',
        header: {
          'Authorization': app.globalData.credential.loginMethod + ' ' +
            that.data.loginCredential,
          'Accept': 'application / vnd.github.v3 + json'
        },
        success: resp => {
          var respData = resp.data;

          for (var key in respData) {
            if (String(respData[key]).indexOf(app.globalData.urls.originalApiAddress) !== -1) {
              respData[key] = String(respData[key]).replace(app.globalData.urls.originalApiAddress, app.globalData.urls.apiAddress);
            }
          }

          that.setData({
            githubUser: respData
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
        url: that.data.githubUser.repos_url 
          + '?page=' + that.data.reposPage
          + '&per_page=' + that.data.reposPerPage,
        header: {
          'Authorization': app.globalData.credential.loginMethod + ' ' +
            that.data.loginCredential,
          'Accept': 'application / vnd.github.v3 + json'
        },
        success: resp => {
          that.setData({
            repos: resp.data,
            isReposFetched: true,
            reposPage: ++(that.data.reposPage)
          });
          return resolve();
        },
        fail: () => {
          reject();
        }
      });
    });
  },

  /**
   * Fetch more repos
   */
  getMoreRepositories: function () {
    let that = this;

    if (that.data.isAllReposFetched || that.data.isReposFetching) {
      return;
    }

    // "Lock" this method for preventing duplicate request
    that.setData({
      isReposFetching: true
    });

    wx.request({
      url: that.data.githubUser.repos_url
        + '?page=' + that.data.reposPage
        + '&per_page=' + that.data.reposPerPage,
      header: {
        'Authorization': app.globalData.credential.loginMethod + ' ' +
          that.data.loginCredential,
        'Accept': 'application / vnd.github.v3 + json'
      },
      success: resp => {
        var moreRepos = that.data.repos;
        
        if (resp.data.length <= that.data.reposPerPage) {
          that.setData({
            isAllReposFetched: true
          });
        }

        if (resp.data.length === 0) {
          return;
        }

        for (var index in resp.data) {
          moreRepos.push(resp.data[index]);
        }

        that.setData({
          repos: moreRepos,
          reposPage: ++(that.data.reposPage),
          isReposFetching: false
        });
      },
      fail: () => {
        that.setData({
          isReposFetching: false
        });
        
        wx.showModal({
          title: app.globalData.modalTitles.error,
          content: app.globalData.notifications.networkError,
          showCancel: false
        });
      }
    });
  }
});