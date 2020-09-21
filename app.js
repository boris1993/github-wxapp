//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    sharing: {
      title: 'Yet Another GitHub client',
      path: '/page/login/login',
      imageUrl: '../../res/YetAnotherGitHubClient.png'
    },
    modalTitles: {
      error: '错误'
    },
    notifications: {
      networkError: '网络请求失败，请稍后再试'
    },
    urls: {
      // 发布版需要将其替换成一个已备案的域名
      // 并将其添加到小程序后台的"request合法域名"中
      // 该域名指向的云引擎已经关闭，不再提供服务，你需要自行在LeanCloud上搭建自己的云引擎
      apiAddress: 'https://ghrevproxy.leanapp.cn/ghapi',
      originalApiAddress: 'https://api.github.com'
    },
    // Login credential will be saved here after a successful login
    credential: {
      loginMethod: 'Basic',
      credential: ''
    }
  }
})
