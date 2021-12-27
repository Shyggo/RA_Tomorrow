// 我的订单界面展示
var app = getApp()
let orderStatus = 0; // 存订单4个状态的变量
let db = wx.cloud.database();
Page({
  data: {
    navbar: ["待上餐", "待评价", "已完成", "已取消"],
    currentTab: 0,
    isShowComment: false, // 是否展示评论框
    list: []
  },
  // 切换顶部按钮
  navbarTap: function (e) {
    let index = e.currentTarget.dataset.idx;
    this.setData({
      currentTab: index // 获取状态索引值
    })
    // 根据0-3的索引值为订单状态赋值
    if (index == 0) {
      orderStatus = 0; // 新订单待上菜
    } else if (index == 1) {
      orderStatus = 1; // 等待用户评价
    } else if (index == 2) {
      orderStatus = 2; // 订单完成
    } else if (index == 3) {
      orderStatus = -1; //订单取消
    } else {
      orderStatus = 0;
    }
    this.getMyOrder();
  },

  onShow: function () {
    this.getMyOrder();
  },

  getMyOrder() {
    let openid = app._checkOpenid();
    if (!openid) {
      return;
    }
    wx.cloud.callFunction({
        name: 'getOrderList',
        data: {
          action: 'user',
          orderStatus: orderStatus
        }
      })
      .then(res => {
        console.log("我的订单列表", res)
        this.setData({
          list: res.result.data
        })
      }).catch(res => {
        console.log("我的订单列表失败", res)
      })
  },
  //去评论页面
  jumpCommentPage() {
    wx.navigateTo({
      url: '../my_comment/my_comment?type=' + 1,
    })
  },
  //弹起评论框
  showComment(event) {
    let orderId = event.currentTarget.dataset.orderid;
    this.setData({
      isShowComment: true,
      orderId: orderId
    })
  },
  //隐藏评论框
  hideComment() {
    this.setData({
      isShowComment: false
    })
  },
  //获取评论内容
  setValue(input) {
    this.setData({
      content: input.detail.value
    })
  },
  //提交评论
  submitComment() {
    let orderId = this.data.orderId;
    this.hideComment(); //隐藏评论框
    let content = this.data.content;
    if (!content) {
      wx.showToast({
        title: '评论内容为空',
      })
      return;
    }
    let openid = app._checkOpenid();
    if (!openid) {
      return;
    }
    db.collection("order").where({
        _id: orderId
      })
      .update({
        data: {
          status: 2
        },
      }).then(res => {
        console.log("修改状态成功", res)
        db.collection("pinglun")
          .add({
            data: {
              orderId: orderId,
              name: app.globalData.userInfo.nickName,
              avatarUrl: app.globalData.userInfo.avatarUrl,
              content: content,
              // _createTime: db.serverDate() //创建的时间
              _createTime: new Date().getTime() //创建的时间
            }
          }).then(res => {
            console.log("评论成功", res)
            wx.showToast({
              title: '评论成功',
            })
            this.getMyOrder()
          }).catch(res => {
            console.log("评论失败", res)
            wx.showToast({
              icon: "none",
              title: '评论失败',
            })
          })
      }).catch(res => {
        console.log("修改状态失败", res)
      })


  },

  //取消订单
  cancelOrder(event) {
    wx.showModal({
      title: '提示!',
      content: '菜品已在制作中,请去收银台联系店员进行取消',
    })
  }
})