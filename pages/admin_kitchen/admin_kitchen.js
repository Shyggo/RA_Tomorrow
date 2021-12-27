// 实现后厨管理界面
var app = getApp()
let orderStatus = 0; // 存储订单状态，三个状态与数据库中一一对应
let db = wx.cloud.database();

// 监听用户下单，初始值为null
let watcher = null

// 设置音频播放相关参数
const innerAudioContext = wx.createInnerAudioContext() // 初始化音频对象
innerAudioContext.loop = true // 设置音频循环播放
innerAudioContext.src = app.globalData.mp3Src // 音乐资源参数
let isPlaying = false // bool值，记录音频是否在放

Page({
  data: {
    // 页面顶部状态切换
    navbar: ["待制作菜品", "已上餐待用户评价", "已完成"],
    currentTab: 0,
    isShowComment: false, 
    list: []
  },
  // 订单状态切换函数
  navbarTap: function (e) {
    let status = e.currentTarget.dataset.idx;
    this.setData({
      currentTab: status
    })
    if (status == 0) {
      orderStatus = 0; // 订单刚下单，未制作的状态
    } else if (status == 1) {
      orderStatus = 1; // 订单待用户评价的状态
    } else if (status == 2) {
      orderStatus = 2; // 订单已完成的状态
    } else {
      orderStatus = 0; // 默认状态，未制作
    }
    this.getUserOrder();
  },

  onShow: function () {
    orderStatus = 0 // 初始化订单状态应为未下单
    this.getUserOrder();
    this.initWatcher()
    innerAudioContext.src = app.globalData.mp3Src // 确保音频初始化成功
  },
  //初始化watcher
  initWatcher() {
    let that = this
    watcher = db.collection('order')
      .watch({
        onChange: function (res) {
          console.log('更新监听到的数据', res)
          if (!res.type && res.docChanges && res.docChanges.length > 0) {
            let obj = res.docChanges[0].doc
            if (obj && obj.status == 0 && !isPlaying) {
              console.log('有用户新下单了')
              // 用户下单时，播放音频
              innerAudioContext.play() 
              innerAudioContext.onPlay(() => {
                console.log('开始播放')
                isPlaying = true
              })
              wx.showModal({
                title: '有新订单！',
                content: '您有新的订单啦，请及时制作！',
                showCancel: false,
                // 订单下单成功时
                success(res) {
                  // 停止音频
                  innerAudioContext.stop()
                  isPlaying = false
                  that.setData({
                    currentTab: 0
                  })
                  orderStatus = 0
                  that.getUserOrder()
                }
              })
            }
          }
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })
  },
  // 获取用户的订单
  getUserOrder() {
    // 存储用户的openid
    let openid = app._checkOpenid();
    if (!openid) {
      return;
    }
    // 后台获取用户openid
    wx.cloud.callFunction({
        name: 'getOrderList',
        data: {
          action:'admin',
          orderStatus: orderStatus
        }
      })
      .then(res => {
        console.log("用户订单列表", res)
        this.setData({
          list: res.result.data
        })
      }).catch(res => {
        console.log("用户订单列表失败", res)
      })
  },
  // 制作完成
  orderFinished(e) {
    console.log(e.currentTarget.dataset.id)
    wx.cloud.callFunction({
      name: 'getKitchen',
      data: {
        id: e.currentTarget.dataset.id
      }
    }).then(res => {
      console.log('制作完成ok', res)
      if (res.result && res.result.stats && res.result.stats.updated > 0) {
        wx.showToast({
          title: '修改成功',
        })
        this.getUserOrder()
      } else {
        wx.showToast({
          icon: 'none',
          title: '提交失败',
        })
      }
    }).catch(res => {
      console.log('制作完成no', res)
      wx.showToast({
        icon: 'none',
        title: '提交失败',
      })
    })
  },

  // 退出时，删除音频并退出监听
  onUnload() {
    console.log("onUnload")
    innerAudioContext.destroy() 
    watcher.close() 
  }

})