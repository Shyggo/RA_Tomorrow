// 首页界面实现
const app = getApp()
let searchKey = '' //搜索词
Page({
  data: {
    isNeedSaoMa: app.globalData.isNeedSaoMa,
    banner: [{
        picUrl: '/image/1.jpg'
      },
      {
        picUrl: '/image/2.jpg'
      },
       {
        picUrl: '/image/3.jpg'
      }
    ],
  },
  // 此函数展示掌柜力荐（销量排行高的菜），获取菜品大图轮播
  onShow() {
    this.getHotGood() 
    this.getTopBanner() 
    // 每次搜索前清空搜索词
    searchKey = '' 
  },
  // 点击菜品大图跳转至点餐界面
  jump_orderPage() {
    wx.navigateTo({
      url: this.checkFoodPage()
    })
  },
  
  // 扫码点餐
  code_scanner() {
    if (app.globalData.isNeedSaoMa) { //需要扫桌码才可以点菜
      wx.scanCode({
        success: res => {
          console.log('扫码结果', res.result)
          app.globalData.address = res.result
          wx.navigateTo({
            url: this.checkFoodPage()
          })
        }
      })
    } else { //不扫码就可以直接点餐
      wx.navigateTo({
        url: this.checkFoodPage()
      })
    }
  },
  // 获取用户资料
  get_userInfo() {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log("获取用户信息成功", res)
        let user = res.userInfo
        this.setData({
          isShowUserName: true,
          userInfo: user,
        })
        user.openid = app.globalData.openid;
        app._saveUserInfo(user);
      },
      fail: res => {
        console.log("获取用户信息失败", res)
      }
    })
  },

  // 展示餐馆地址
  show_resAddress() {
    wx.navigateTo({
      url: '/pages/address/address',
    })
  },
  goToStandby() {
    wx.navigateTo({
      url: '/pages/standby/standby',
    })
  },
  // 跳转到购物车界面
  jump_cart() {
    // wx.switchTab({
    //   url: '/pages/cart/cart',
    // })
    wx.navigateTo({
      url: '/pages/menu_browse/menu_browse',
    })
  },

  // 跳转至排队等号界面
  jump_queue() {
    wx.navigateTo({
      url: '/pages/queue_up/queue_up',
    })
  },

  // 读取用户输入
  user_input(e) {
    searchKey = e.detail.value
  },
  // 搜索
  jump_searchResult() {
    wx.navigateTo({
      url: '/pages/menu_browse/menu_browse?searchKey=' + searchKey,
    })
  },
  
  // 选择两种不同的点餐界面
  checkFoodPage() {
    if (app.globalData.isNeedFenLei) {
      return '/pages/hall_food/hall_food'
    } else {
      return '/pages/menu_browse/menu_browse'
    }
  },

  getTopBanner() {
    wx.cloud.database().collection("lunbotu")
      .get()
      .then(res => {
        console.log("首页banner成功", res.data)
        if (res.data && res.data.length > 0) {
          //如果后台配置轮播图就用后台的，没有的话就用默认的
          this.setData({
            banner: res.data
          })
        }
      }).catch(res => {
        console.log("首页banner失败", res)
      })
  },
  // 从数据库获得菜品畅销排名
  getHotGood() {
    wx.cloud.callFunction({
      name: "getFoodList",
      data: {
        action: "getHot"
      }
    }).then(res => {
      console.log("热门菜品数据", res.result)
      this.setData({
        goodList: res.result.data,
      })
    }).catch(res => {
      console.log("菜品数据请求失败", res)
    })
  },
})