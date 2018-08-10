//index.js
//获取应用实例
const app = getApp();
const base64util = require('../../utils/base64.js');

Page({
  data: {
    // Placeholders
    placeHolderUsername: 'GitHub用户名',
    placeHolderCredential: 'GitHub密码',
    // Notifications
    modalTitles: {
      error: '错误'
    },
    notifications: {
      badLogin: '登陆失败',
      forbidden: '错误次数过多，登陆功能已被停用，请稍后再试',
      networkError: '网络请求失败，请稍后再试'
    },
    // Is authenticating with token? 
    useToken: false,
    // Will the credential be saved on local?
    saveCredential: true,
    // Information about the credential
    credential: {
      loginMethod: 'Basic',
      username: '',
      credential: ''
    }
  },
  // Customize the sharing
  onShareAppMessage: function(res) {
    return app.globalData.sharing;
  },
  onLoad: function() {
    let savedCredential = wx.getStorageSync('githubcredential');
    
    if (savedCredential) {
      this.setData({
        credential: savedCredential
      });

      if ('Basic' == savedCredential.loginMethod) {
        let credential = base64util.base64_encode(
          savedCredential.username + ':' + savedCredential.password
        );
        this.performLogin(
          this, 
          savedCredential.loginMethod, 
          credential, 
          this.checkLoginResult
        );
      } else {
        this.performLogin(
          this,
          savedCredential.loginMethod,
          savedCredential.credential,
          this.checkLoginResult
        );
      }
    }
  },
  // When "Login with token" switch flips
  switchLoginMethod: function(e) {
    // Flip the flag for login method
    this.setData({
      useToken: e.detail.value,
    });

    // Update the place holder
    if (e.detail.value == false) {
      // When using password
      this.setData({
        placeHolderCredential: 'GitHub密码',
        credential: {
          loginMethod: 'Basic',
          username: this.data.credential.username,
          credential: this.data.credential.credential
        }
      })
    } else {
      // When using token
      this.setData({
        placeHolderCredential: 'GitHub Token',
        credential: {
          loginMethod: 'token',
          username: this.data.credential.username,
          credential: this.data.credential.credential
        }
      })
    }
  },
  // If the login credential will be saved locally
  swtichIfSaveCredential: function(e) {
    this.setData({
      saveCredential: e.detail.value
    });
  },
  usernameInputOnChange: function(e) {
    this.setData({
      credential: {
        loginMethod: this.data.credential.loginMethod,
        username: e.detail.value,
        credential: this.data.credential.credential
      }
    })
  },
  credentialInputOnChange: function(e) {
    this.setData({
      credential: {
        loginMethod: this.data.credential.loginMethod,
        username: this.data.credential.username,
        credential: e.detail.value
      }
    })
  },
  /**
   * How the login button works
   */
  login: function() {
    if (this.data.useToken) {
      if (this.data.credential.credential != '') {
        // Logging in with token
        this.performLogin(
          this,
          'token',
          this.data.credential.credential,
          this.checkLoginResult
        );
      } else {
        wx.showModal({
          title: app.globalData.modalTitles.error,
          content: 'Token不可为空',
          showCancel: false
        });
      }
    } else {
      // Logging in with username and password
      if (this.data.credential.username == '' 
          || this.data.credential.password == '') {
        wx.showModal({
          title: app.globalData.modalTitles.error,
          content: '用户名和密码不可为空',
          showCancel: false
        });
      } else {
        let username = this.data.credential.username;
        let password = this.data.credential.credential;
        let credential = base64util.base64_encode(username + ':' + password);
        this.performLogin(this, 'Basic', credential, this.checkLoginResult);
      }
    }
  },
  /**
   * Perform logging in to GitHub
   * @param that Reference to the global context "this"
   * @loginMethod The type of the authentication, "Basic" or "token"
   * @credential The credential for logging in, token or the Base64-ed username and passsword combination
   * @checkResultCallback Reference to the function which will handle the response
   */
  performLogin: (that, loginMethod, credential, checkResultCallback) => {
    wx.showLoading({
      title: '登陆中......',
      mask: true
    });

    wx.request({
      url: 'https://api.github.com',
      header: {
        'Authorization': loginMethod +' ' + credential,
        'Accept': 'application / vnd.github.v3 + json'
      },
      success: resp => {
        checkResultCallback(that, resp);
      },
      fail: () => {
        wx.hideLoading();
        wx.showModal({
          title: app.globalData.modalTitles.error,
          content: app.globalData.notifications.networkError,
          showCancel: false
        })
      }
    });
  },
  /**
   * Handles the response of the login request
   * @param that Reference to the global context "this"
   * @resp The response of the login request
   */
  checkLoginResult: (that, resp) => {
    let respData = resp.data;
    let respCode = resp.statusCode;
    wx.hideLoading();
    if ('200' == respCode) {
      // If the credential will be saved to local storage
      if (that.data.saveCredential) {
        wx.setStorage({
          key: 'githubcredential',
          data: that.data.credential
        })
      }
      app.globalData.credential = that.data.credential;
      wx.redirectTo({
        url: '/pages/index/index'
      })
    } else if ('401' == respCode) {
      wx.showToast({
        title: that.data.notifications.badLogin,
        icon: 'none'
      });
    } else if ('403' == respCode) {
      wx.showToast({
        title: that.data.notifications.forbidden,
        icon: 'none'
      });
    }
  }
})
