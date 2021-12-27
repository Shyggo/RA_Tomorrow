const db = wx.cloud.database()
const app = getApp();
Page({
  data: {
    isShowUserName: false, 
    userInfo: null,
  },
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料', 
      success: (res) => {
        console.log("获取用户信息成功", res)
        let user = res.userInfo
        this.setData({
          isShowUserName: true,
          userInfo: user,
        })

        user.openid = app.globalData.openid;
        app._saveUserInfo(user);
        db.collection("vip").where({
          name:user.name
        })
        .get()
        .then(
          res=>{

           var date=new Date(res.data[0].time)
            let year = date.getFullYear()
            let month = date.getMonth() + 1
            let day = date.getDate()
            let key = '' + year+"年" + month+"月" + day+"日"

console.log(date);
           if(res.data.length!=0){
             this.setData(
               {
                 standby:"DIO",
                 endtime:key,
                 show:true
               }
             )
           }
          }
        )
      },
      fail: res => {
        console.log("获取用户信息失败", res)
      }
    })
  },
  
  // 用户退出登录
  logout() {
    wx.setStorageSync('user', null)
    this.setData({
      userInfo: null,
      isShowUserName: false
    })
  },
  // 回到订单界面
  jumpMyOrder: function () {
    wx.navigateTo({
      url: '../my_order/my_order',
    })
  },

  // 跳转到我的评论界面
  jumpMyComment: function () {
    wx.navigateTo({
      url: '../my_comment/my_comment?type=1',
    })
  },

  change() {
    wx.navigateTo({
      url: '../change/change',
    })
  },
  // 跳转到管理员界面
  jumpAdmin() {
    wx.navigateTo({
      url: '../stuff/stuff',
    })
  },
  // 跳转到所有评论界面
  jumpCommentPage() {
    wx.navigateTo({
      url: '/pages/my_comment/my_comment?type=' + 1,
    })
  },
  // 跳转到用户排号界面
  jumpQueue() {
    wx.navigateTo({
      url: '/pages/queue_up/queue_up',
    })
  },
  onShow(options) {
    var user = app.globalData.userInfo;
    if (user && user.nickName) {
      this.setData({
        isShowUserName: true,
        userInfo: user,
      })
    }
  },

  //生命周期函数--监听页面加载
  onLoad: function (options) {
    var that = this;
    var user = app.globalData.userInfo;
    // if (user) {
    //   // that.setData({
    //   //  isShowUserName: true,
    //   //  userInfo: user,
    //   // })
    // } else {
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.userInfoReadyCallback = res => {
    //     that.setData({
    //       userInfo: res.userInfo,
    //       isShowUserName: true
    //     })
    //   }
    // }
  },
})