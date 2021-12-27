// 支付界面实现
let app = getApp();
const db = wx.cloud.database()
var lzy="hhh"
Page({
  data: {  
    address: app.globalData.address,
    diner_num: '', 
    beizhu: "", // 备注
    // 支付方式列举
    payWayList: [{ 
      "id": 1,
      "package": "会员卡支付"
    }, {
      "id": 2,
      "package": "微信支付"
    }, {
      "id": 3,
      "package": "银行卡支付"
    }],
    cartList: [], // 初始化购物车为空
    totalPrice: 0, 
    totalNum: 0, 
    maskFlag: true, // 弹窗遮罩标识
  },
  onLoad() {
    console.log('app地址', app.globalData.address)
    // 三个桌子的码号
    if(app.globalData.address=="﻿1号桌"){
      lzy="fa4fe87261a6d8560139503a3197ea74"
    }
    if(app.globalData.address=="﻿2号桌"){
      lzy="5026485b61a6d85c00fc64a52b0904f6"
    }
    if(app.globalData.address=="﻿3号桌"){
      lzy="908462d561a6d862011436b416e9a6ef"
    }
    console.log('app地址', app.globalData.address)
    console.log("lzy",lzy)
    this.setData({
      address: app.globalData.address
    })
    // 获取购物车数据展示
    var arr = wx.getStorageSync('cart') || [];
    for (var i in arr) {
      this.data.totalPrice += arr[i].quantity * arr[i].price;
      this.data.totalNum += arr[i].quantity
    }
    this.setData({
      cartList: arr,
      totalPrice: this.data.totalPrice.toFixed(2)-Math.floor(this.data.totalPrice.toFixed(0)/50)*5,
      totalNum: this.data.totalNum
    })
  },
  // 更新点击数据显示
  get_customer_num(e) {
    this.setData({
      diner_num: e.currentTarget.dataset.num // 数据库中num变量存储
    });
  },
  // 获取用户输入就餐人数信息
  get_userInput(e) {
    this.setData({
      diner_num: e.detail.value
    })
  },
  // 获取顾客备注
  get_user_remark(e) {
    this.setData({
      beizhu: e.detail.value
    })
  },
  // 打开选择支付方式的弹窗
  openPay() {
    var that = this;
    var rd_session = wx.getStorageSync('rd_session') || [];

    // 动画显示
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out',
      delay: 0
    });
    that.animation = animation;
    animation.translate(0, -285).step();
    that.setData({
      animationData: that.animation.export(),
    });
    that.setData({
      maskFlag: false,
    });
  },
  // 关闭弹窗
  closePay() {
    var that = this
    that.animation.translate(0, 285).step();
    that.setData({
      animationData: that.animation.export()
    });
    that.setData({
      maskFlag: true
    });
  },


  // 下单并提示付款，未选择就餐人数不可下单
  updateData: function (e) {
    let id = this.data.id
    let arr = wx.getStorageSync('cart') || [];
    let arrNew = []
    arr.forEach(item => {
      arrNew.push({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      })
    });
   // 如果没有选择就餐人数的情况
    if (!this.data.diner_num) {
      wx.showToast({
        icon: 'none',
        title: '请选择就餐人数',
      })
      return
    }0
    db.collection("order").add({
      data: {
        name: app.globalData.userInfo.nickName,
        renshu: parseInt(this.data.diner_num), 
        beizhu: this.data.beizhu,
        address: app.globalData.address,
        totalPrice: this.data.totalPrice, // 存储总金额
        orderList: arrNew,
        status: 0, // 更新至下单成功，等待后厨做菜阶段
        _createTime: new Date().getTime() 
      }
    }).then(res => {
      console.log("支付成功", res)
      this.animation.translate(0, 285).step();
      this.setData({
        animationData: this.animation.export()
      });
      this.setData({
        maskFlag: true
      });
      wx.showToast({
        title: '下单成功！',
      })
      wx.cloud.database().collection("table")
        .doc(lzy)
        .update({
            data:{
                status:"正在使用"
            }
        })
      // 增加下单的菜品数额，用于统计菜品热销排行
      wx.cloud.callFunction({
        name: "addSalesVolume",
        data: {
          id: res._id
        }
      }).then(res => {
        // 更新数据库成功日志
        console.log('添加销量成功', res)
        wx.setStorageSync('cart', "")
        wx.switchTab({
          url: '../user/user',
        })
      }).catch(res => {
        console.log('添加销量失败', res)
        wx.showToast({
          icon: 'none',
          title: '支付失败',
        })
      })

    }).catch(res => {
      wx.showToast({
        icon: 'none',
        title: '支付失败',
      })
      console.log("支付失败", res)
    })
  },


})