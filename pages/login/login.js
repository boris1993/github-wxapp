//index.js
//获取应用实例
const app = getApp()
const base64util = require('../../utils/base64.js')

Page({
  data: {
    // Placeholders
    placeHolderUsername: 'GitHub用户名',
    placeHolderCredential: 'GitHub密码',
    // Notifications
    notifications: {
      notificationBadLogin: '登陆失败',
      notificationForbidden: '错误次数过多，登陆功能已被停用，请稍后再试'
    },
    // Is authenticating with token? 
    useToken: false,
    // Will the credential be saved on local?
    saveCredential: false,
    // Login credential from input
    username: '',
    credential: '',
    // Information about the credential
    savedCredential: {
      loginMethod: 'password',
      username: '',
      credential: ''
    }
  },
  // Customize the sharing
  onShareAppMessage: function(res) {
    return {
      title: 'Yet Another GitHub client',
      path: '/page/index',
      imageUrl: '../../res/YetAnotherGitHubClient.png'
    }
  },
  onLoad: function () {
    // TODO: Check if the login credential exists
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // When "Login with token" switch flips
  switchLoginMethod: function(e) {
    // Flip the flag for login method
    this.setData({
      useToken: e.detail.value
    });

    // Update the place holder
    if (e.detail.value == false) {
      this.setData({
        placeHolderCredential: 'GitHub密码'
      })
    } else {
      this.setData({
        placeHolderCredential: 'GitHub Token'
      })
    }
  },
  // If the login credential will be saved locally
  swtichIfSaveCredential: function(e) {
    this.setData({
      saveCredential: e.detail.value
    })
  },
  usernameInputOnChange: function(e) {
    this.setData({
      username: e.detail.value
    })
  },
  credentialInputOnChange: function(e) {
    this.setData({
      credential: e.detail.value
    })
  },
  login: function () {
    wx.showLoading({
      title: '登陆中......'
    })

    if (this.data.useToken) {
      wx.request({
        url: 'https://api.github.com',
        header: {
          'Authorization': 'token ' + this.data.credential
        },
        success: resp => {
          checkLoginResult(resp, this.data.notifications);
        }
      })
    } else {
      let username = this.data.username;
      let password = this.data.credential;
      let credential = base64util.base64_encode(username + ':' + password);
      wx.request({
        url: 'https://api.github.com',
        header: {
          'Authorization': 'Basic ' + credential
        },
        success: resp => {
          checkLoginResult(resp, this.data.notifications);
        }
      })
    }
  }
})

/**
 * Check if the login is successful
 * @param resp The response from wx.request
 * @param toastNotifications A group of notification messages
 */
const checkLoginResult = (resp, toastNotifications) => {
  let that = this;
  let respData = resp.data;
  let respCode = resp.statusCode;
  wx.hideLoading();
  if ('200' == respCode) {
    // TODO: Jump to main page
  } else if ('401' == respCode) {
    wx.showToast({
      title: toastNotifications.notificationBadLogin,
      icon: 'none'
    });
  } else if ('403' == respCode) {
    wx.showToast({
      title: toastNotifications.notificationForbidden,
      icon: 'none'
    });
  }
}