let app = getApp();
const db = wx.cloud.database()
var lzy="hhh"
Page({
  data: { //页面的初始数据   
    address: app.globalData.address,
    diner_num: '', // 输入框中的用餐人数 
    beizhu: "", // 备注信息
    payWayList: [{ //模拟支付方式列表
      "id": 1,
      "package": "会员卡支付"
    }, {
      "id": 2,
      "package": "微信支付"
    }, {
      "id": 3,
      "package": "银行卡支付"
    }],
    cartList: [], // 购物车数据
    totalPrice: 0, //总价
    totalNum: 0, //总数量
    maskFlag: true, // 遮罩
  },
  onLoad() {
    var price=0
    console.log('app地址', app.globalData.address)
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
     console.log("hao",this.data.address)
    //购物车的数据
    var arr = wx.getStorageSync('cart') || [];
    for (var i in arr) {
      price += arr[i].quantity * arr[i].price;
      this.data.totalNum += arr[i].quantity
    }
      price=price.toFixed(2)-Math.floor(price.toFixed(0)/50)*5,
    db.collection("vip").where({
      name:app.globalData.userInfo.nickName
    }).get().then(res=>{
    if(res.data.length!=0){
      price*=0.9
      
      console.log("here",price)
      this.setData(
        {
        cartList: arr,
        totalPrice: price.toFixed(2),
        totalNum: this.data.totalNum
      })
      wx.showToast({
        title: '您有强大的替身使者，将享受九折优惠',
        icon: 'none',
        duration: 1500
      })
      
    }
    else{
      this.setData(
        {
        cartList: arr,
        totalPrice: price,
        totalNum: this.data.totalNum
      })
    }
    })
    .catch(res=>{
console.log("bug",res)
    })
    console.log("there",price)
  
    
 
  
  },
  // 点击数字，输入框出现对应数字
  getDinnerNUM(e) {
    this.setData({
      diner_num: e.currentTarget.dataset.num
    });
  },
  // 获取输入的用餐人数
  getInputNum(e) {
    this.setData({
      diner_num: e.detail.value
    })
  },
  // 获取备注信息
  getRemark(e) {
    this.setData({
      beizhu: e.detail.value
    })
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

  //打开支付方式弹窗
  choosePayWay() {
    var that = this;
    var rd_session = wx.getStorageSync('rd_session') || [];

    // 支付方式打开动画
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
  // 支付方式关闭方法
  closePayWay() {
    var that = this
    // 支付方式关闭动画
    that.animation.translate(0, 285).step();
    that.setData({
      animationData: that.animation.export()
    });
    that.setData({
      maskFlag: true
    });
  },

  get_customer_num(e) {
    this.setData({
      diner_num: e.currentTarget.dataset.num // 数据库中num变量存储
    });
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

  //提交订单
  submitOrder: function (e) {
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
        renshu: parseInt(this.data.diner_num), //用餐人数,
        beizhu: this.data.beizhu,
        address: app.globalData.address,
        totalPrice: this.data.totalPrice, //总价钱
        orderList: arrNew, //存json字符串
        status: 0, //-1订单取消,0新下单待上餐,1待用户评价,2订单已完成
        // _createTime: db.serverDate() //创建的时间
        _createTime: new Date().getTime() //创建的时间
      }
    }).then(res => {
      console.log("支付成功", res)
      // 支付方式关闭动画
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
                status:"使用中"
            }
        })
      //支付成功后，把购买的菜品销量增加
      wx.cloud.callFunction({
        name: "addSalesVolume",
        data: {
          id: res._id
        }
      }).then(res => {
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
    
      wx.cloud.database().collection("table")
        
          .doc(lzy)
          .update(
            {
              data:{
                status:"正在使用"
              }
            }
          )
       
       
      // .then(res=>{
      // 增加下单的菜品数额，用于统计菜品热销排行
      wx.cloud.callFunction({
        name: "addSalesVolume",
        data: {
          id: res._id
        }
      }).then(res => {
        // 更新数据库成功日志
        console.log('添加销量成功', res)
        wx.showToast({
          title: '下单成功！',
        })
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
        console.log("支付失败", res)
      })
      },

    
      
    
  )}})
