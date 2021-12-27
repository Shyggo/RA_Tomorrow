let app = getApp();
//云数据库相关
const db = wx.cloud.database({});

Page({
  data: {
    searchKey: '', // 搜索词
    foodList: [], // 菜品列表 
    cartList: [], // 购物车列表
    hasList: false, // 列表是否有数据
    totalPrice: 0, // 菜品总价格
    totalNum: 0, // 菜品总数量
    // 购物车动画的相关信息
    animationData: {},
    animationMask: {},
    maskVisual: "hidden",
    maskFlag: true,
  },

  onLoad(e) {
    let searchKey = e.searchKey
    if (searchKey) {
      // 根据搜索词找到菜品
      this.getDishList('search', searchKey)
      this.setData({
        searchKey: searchKey 
      })
    } else {
      // 获取菜品相关信息
      this.getDishList('getAll')
    }

  },
  // 获取用户输入的菜品名
  getSearchKey(e) {
    this.setData({
      searchKey: e.detail.value 
    })
  },
  // 搜索函数
  searchFunc() {
    this.getDishList('search', this.data.searchKey)
  },
  // 获取菜品列表
  getDishList(action, searchKey) {
    // 从购物车中获取列表
    let cartList = wx.getStorageSync('cart') || [];
    wx.cloud.callFunction({
      name: "getFoodList",
      data: {
        action: action,
        searchKey: searchKey // 搜索词
      }
    }).then(res => {
      let dataList = res.result.data;
      console.log("菜品数据", res)
      dataList.forEach(food => {
        food.quantity = 0;
        cartList.forEach(cart => {
          if (cart._id == food._id) {
            food.quantity = cart.quantity ? cart.quantity : 0; // 菜品名确认后，获取菜品数量
          }
        })
      });
      this.setData({
        cartList: cartList,
        foodList: dataList,
      })
      this.getPriceAndNum()
    }).catch(res => {
      console.log("菜品数据请求失败", res)
    })
  },
  // 减少购物车某单品数量
  minusDishNum(e) {
    let item = e.currentTarget.dataset.item;
    let cartList = wx.getStorageSync('cart') || [];
    let foodList = this.data.foodList
    for (let i in foodList) {
      if (foodList[i]._id == item._id) {
        if (foodList[i].quantity && foodList[i].quantity > 0) {
          foodList[i].quantity -= 1;
        } else {
          foodList[i].quantity = 0;
        }
        if (cartList.length > 0) {
          for (let j in cartList) {
            if (cartList[j]._id == item._id) {
              cartList[j].quantity ? cartList[j].quantity -= 1 : 0
              if (cartList[j].quantity <= 0) {
                // 购买数里为0就从购物车里删除
                this.removeByValue(cartList, item._id)
              }
              if (cartList.length <= 0) {
                this.setData({
                  foodList: foodList,
                  cartList: [],
                  totalNum: 0,
                  totalPrice: 0,
                })
                // this.cascadeDismiss()
              }
              try {
                wx.setStorageSync('cart', cartList)
              } catch (e) {
                console.log(e)
              }
            }
          }
        }
      }
    }
    this.setData({
      cartList: cartList,
      foodList: foodList
    })
    this.getPriceAndNum();
  },
  // 根据id删除，暂不用
  removeByValue(array, id) {
    for (var i = 0; i < array.length; i++) {
      if (array[i]._id == id) {
        array.splice(i, 1);
        break;
      }
    }
  },

  // 增加购物车某单品数量
  addDishNum(e) {
    let item = e.currentTarget.dataset.item;
    let arr = wx.getStorageSync('cart') || [];
    let flag = false;
    // 遍历菜品列表信息，找到匹配
    for (let i in this.data.foodList) { 
      console.log("当前点击的id", item._id, "foodid", this.data.foodList[i]._id)
      if (this.data.foodList[i]._id == item._id) {
        this.data.foodList[i].quantity += 1;
        if (arr.length > 0) {
          // 找到被点击加数额的菜品，对其操作
          for (let j in arr) { 
            if (arr[j]._id == item._id) {
              arr[j].quantity += 1;
              flag = true;
              try {
                wx.setStorageSync('cart', arr)
              } catch (e) {
                console.log(e)
              }
              break;
            }
          }
          if (!flag) {
            arr.push(this.data.foodList[i]);
          }
        } else {
          arr.push(this.data.foodList[i]);
        }
        try {
          wx.setStorageSync('cart', arr)
        } catch (e) {
          console.log(e)
        }
        break;
      }
    }

    this.setData({
      cartList: arr,
      foodList: this.data.foodList
    })
    this.getPriceAndNum();
  },


  // 获取菜品总价格、总数量
  getPriceAndNum() {
    var cartList = this.data.cartList; // 获取购物车列表
    var totalP = 0;
    var totalN = 0
    for (var i in cartList) { // 循环列表得到每个数据
      totalP += cartList[i].quantity * cartList[i].price; // 所有价格加起来     
      totalN += cartList[i].quantity
    }
    this.setData({ // 最后赋值到data中渲染到页面
      cartList: cartList,
      totalNum: totalN,
      totalPrice: totalP.toFixed(2)
    });
  },
  // 清空购物车
  cleanList(e) {
    for (var i in this.data.foodList) {
      this.data.foodList[i].quantity = 0;
    }
    try {
      wx.setStorageSync('cart', "")
    } catch (e) {
      console.log(e)
    }
    this.setData({
      foodList: this.data.foodList,
      cartList: [],
      totalNum: 0,
      totalPrice: 0,
    })
    this.cascadeDismiss()
  },

  // 删除某单项菜品（去除所有数量）
  deleteByDish(e) {
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var arr = wx.getStorageSync('cart')
    for (var i in this.data.foodList) {
      if (this.data.foodList[i]._id == id) {
        this.data.foodList[i].quantity = 0;
      }
    }
    arr.splice(index, 1);
    if (arr.length <= 0) {
      this.setData({
        foodList: this.data.foodList,
        cartList: [],
        totalNum: 0,
        totalPrice: 0,
      })
      this.cascadeDismiss()
    }
    try {
      wx.setStorageSync('cart', arr)
    } catch (e) {
      console.log(e)
    }
    this.setData({
      cartList: arr,
      foodList: this.data.foodList
    })
    this.getPriceAndNum()
  },
  // 购物车开关状态改变
  cascadeToggle: function () {
    var that = this;
    var arr = this.data.cartList
    if (arr.length > 0) {
      if (that.data.maskVisual == "hidden") {
        that.cascadePopup()
      } else {
        that.cascadeDismiss()
      }
    } else {
      that.cascadeDismiss()
    }
  },
  // 打开购物车的动画演示代码
  cascadePopup: function () {
    var that = this;
    // 打开动画
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
    // 渐变动画
    var animationMask = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
    });
    that.animationMask = animationMask;
    animationMask.opacity(0.8).step();
    that.setData({
      animationMask: that.animationMask.export(),
      maskVisual: "show",
      maskFlag: false,
    });
  },
  // 关闭购物车的动画演示代码
  cascadeDismiss: function () {
    var that = this
    // 关闭动画
    that.animation.translate(0, 285).step();
    that.setData({
      animationData: that.animation.export()
    });
    // 渐变动画
    that.animationMask.opacity(0).step();
    that.setData({
      animationMask: that.animationMask.export(),
    });
    // 隐藏遮罩层
    that.setData({
      maskVisual: "hidden",
      maskFlag: true
    });
  },
  // 跳转确认订单页面
  jumpOrderPage: function () {
    var arr = wx.getStorageSync('cart') || [];
    if (!arr || arr.length == 0) {
      wx.showModal({
        title: '提示',
        content: '请选择菜品'
      })
      return;
    }

    let userInfo = app.globalData.userInfo;
    if (!userInfo || !userInfo.nickName) {
      wx.showModal({
        title: '请登录',
        content: '请到个人中心登录',
        showCancel: false, // 去掉取消按钮
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../user/user',
            })
          }
        }
      })
      return;
    }
    if (app.globalData.isNeedSaoMa && !app.globalData.address) {
      // 重新点餐
      wx.showToast({
        icon: 'none',
        title: '回首页扫码点餐'
      })
      return
    }
    if (!app.globalData.isNeedSaoMa) {
      app.globalData.address = '店内下单'
    }

    wx.navigateTo({
      url: '/pages/take_away/take_away'
    })

  },
})