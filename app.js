// 全局js渲染的实现
App({
  globalData: { // 创建一个小程序页面所需要的对象，方便操作
    mp3Src: 'cloud://cloud1-2g66ihwn498306a8.636c-cloud1-2g66ihwn498306a8-1308085111/MP3/laidanle.wav', // 编入一个下单音乐
    isNeedSaoMa: true,  // 设置一个bool属性isNeedSaoMa，判断当前用户操作功能时是否需要扫码登陆
    address: '',  // 设置一个address变量来储存地址，扫码点餐时为true可为1，2，3号桌，当打包带走的时候变量值为false，默认为外带
    isNeedFenLei: true, // 设置一个bool属性isNeedFenLei变量来决定显示菜单的时候是否需要分类，当为true时需要分类，当为false时不需要分类
    userInfo: {},
    openid: null,
  },
  onLaunch: function () {
    wx.cloud.init({  // 初始化一个云开发环境，保存自己的云函数和云数据库
      env: 'cloud1-2g66ihwn498306a8', 
      traceUser: true,
    })
    this.getOpenid();
  },
  getOpenid: function () { // 设置一个函数获取用户的openid
    var app = this;
    var openidStor = wx.getStorageSync('openid');
    if (openidStor) {
      console.log('本地获取openid:' + openidStor);
      app.globalData.openid = openidStor;
      app._getMyUserInfo();
    } else {
      wx.cloud.callFunction({
        name: 'getOpenid',
        success(res) {
          console.log('云函数获取openid成功', res.result.openid)
          var openid = res.result.openid;
          wx.setStorageSync('openid', openid)
          app.globalData.openid = openid;
          app._getMyUserInfo();
        },
        fail(res) {
          console.log('云函数获取失败', res)
        }
      })
    }
  },

  _getMyUserInfo() { // 设置一个函数用来获取自身后台的账户信息
    let app = this
    var userStor = wx.getStorageSync('user');
    if (userStor) {
      console.log('本地获取user', userStor)
      app.globalData.userInfo = userStor;
    }
    wx.request({
      url: app.globalData.baseUrl + '/user/getUserInfo',
      data: {
        openid: app.globalData.openid
      },
      success: function (res) {
        console.log("Java后台返回的用户信息", res.data)
        if (res && res.data && res.data.data) {
          app.globalData.userInfo.nickName = res.data.data.username;
          app.globalData.userInfo.realphone = res.data.data.phone;
          app.globalData.userInfo.realzhuohao = res.data.data.zhuohao;
          app.globalData.userInfo.realrenshu = res.data.data.renshu;
          console.log("===app.globalData===", app.globalData.userInfo)
          app._saveUserInfo(app.globalData.userInfo);
        }
      }
    })
  },
  _checkOpenid() { // 设置一个函数检查自己的openid
    let app = this
    let openid = this.globalData.openid;
    if (!openid) {
      app.getOpenid();
      wx.showLoading({
        title: 'openid不能为空，请重新登录',
      })
      return null;
    } else {
      return openid;
    }
  },
  _saveUserInfo: function (user) { // 设置一个函数来保存自己的账户信息
    this.globalData.userInfo = user;
    wx.setStorageSync('user', user)
  },


  _getWeek: function () { // 设置一个函数来获取当前的时间
    let date = new Date(); // 将获得的时间转换为字符串的形式
    let month = date.getMonth() + 1;
    let week = this.getWeekFromDate(date);
    if (week === 0) { 
      month = date.getMonth();
      let dateLast = new Date();
      let dayLast = new Date(dateLast.getFullYear(), dateLast.getMonth(), 0).getDate();
      let timestamp = new Date(new Date().getFullYear(), new Date().getMonth() - 1, dayLast);
      week = this.getWeekFromDate(new Date(timestamp));
    }
    let time = month + "月第" + week + "周";
    return time;
  },

  getWeekFromDate: function (date) { // 设置一个函数把获得的字符串转换为标准的时间格式
    let w = date.getDay(); // 得到今天是周几的信息
    if (w === 0) {
      w = 7;
    }
    let week = Math.ceil((date.getDate() + 6 - w) / 7) - 1;
    return week;
  },

  _getCurrentTime() { // 设置一个函数获取当前的系统时间
    var d = new Date();
    var month = d.getMonth() + 1;
    var date = d.getDate();
    var day = d.getDay();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    var ms = d.getMilliseconds();

    var curDateTime = d.getFullYear() + '年';
    if (month > 9)
      curDateTime += month + '月';
    else
      curDateTime += month + '月';

    if (date > 9)
      curDateTime = curDateTime + date + "日";
    else
      curDateTime = curDateTime + date + "日";
    if (hours > 9)
      curDateTime = curDateTime + hours + "时";
    else
      curDateTime = curDateTime + hours + "时";
    if (minutes > 9)
      curDateTime = curDateTime + minutes + "分";
    else
      curDateTime = curDateTime + minutes + "分";
    return curDateTime;
  },

  _getNianYuiRi() { // 设置一个函数获取当前的系统的年月日
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let key = '' + year + month + day
    console.log('当前的年月日', key)
    return key
  }
})