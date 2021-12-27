// 购物车页面实现
const app = getApp()
Page({
  data: {
    cartList: [],
    totalPrice: 0, // 总价格统计
    totalNum: 0, // 总菜品数统计
  },
  onShow() {
    let cartList = wx.getStorageSync('cart') || [];
    this.setData({
      cartList
    })
    this.getPriceAndNum();
  },
  // 获取购物车总价、总菜数
  getPriceAndNum() {
    var cartList = this.data.cartList;
    var price = 0;
    var num = 0
    // 遍历列表，累加计算总菜价和总菜数
    for (var i in cartList) { 
      price += cartList[i].quantity * cartList[i].price;
      num += cartList[i].quantity
    }
    // 页面渲染
    this.setData({
      cartList: cartList,
      totalNum: num,
      totalPrice: price.toFixed(2)
    });
  },
  // 增加某菜品单品数量
  addDishNum(e) {
    let item = e.currentTarget.dataset.item;
    let arr = wx.getStorageSync('cart') || [];
    let flag = false;
    if (arr.length > 0) {
      // 找到被点击增加菜品数量按钮的那道菜，做出反馈
      for (let j in arr) { 
        if (arr[j]._id == item._id) {
          arr[j].quantity += 1;
          flag = true; // 更改成功的标志
          try {
            wx.setStorageSync('cart', arr)
          } catch (e) {
            console.log(e)
          }
          break;
        }
      }
      if (!flag) {
        arr.push(item);
      }
    } else {
      arr.push(item);
    }
    try {
      wx.setStorageSync('cart', arr)
    } catch (e) {
      console.log(e)
    }
    // 如果操作成功，重新调用函数计算菜品价格
    this.setData({
      cartList: arr,
    }, success => {
      this.getPriceAndNum();
    })

  },
  // 减少某菜品单品数量
  minusDishNum(e) {
    let item = e.currentTarget.dataset.item;
    let cartList = wx.getStorageSync('cart') || [];
    if (cartList.length > 0) {
      for (let j in cartList) {
        if (cartList[j]._id == item._id) {
          cartList[j].quantity ? cartList[j].quantity -= 1 : 0
          // 考虑单品数量减到0情况，直接将菜品从购物车中去除
          if (cartList[j].quantity <= 0) {
            this.removeByValue(cartList, item._id)
          }
          if (cartList.length <= 0) {
            this.setData({
              cartList: [],
              totalNum: 0,
              totalPrice: 0
            })
          }
          try {
            wx.setStorageSync('cart', cartList)
          } catch (e) {
            console.log(e)
          }
        }
      }
    }
    this.setData({
      cartList: cartList
    }, success => {
      this.getPriceAndNum();
    })
  },
  // 根据id删除数组，暂时用不到
  removeByValue(array, id) {
    for (var i = 0; i < array.length; i++) {
      if (array[i]._id == id) {
        array.splice(i, 1);
        break;
      }
    }
  },
  // 删除购物车单项菜品
  deleteByDish(e) {
    var index = e.currentTarget.dataset.index;
    var arr = wx.getStorageSync('cart')
    arr.splice(index, 1);
    if (arr.length <= 0) {
      this.setData({
        cartList: [],
        totalNum: 0,
        totalPrice: 0
      })
    }
    try {
      wx.setStorageSync('cart', arr)
    } catch (e) {
      console.log(e)
    }
    this.setData({
      cartList: arr
    }, success => {
      this.getPriceAndNum();
    })
  },
  // 跳转到下单界面
  jumpFoodPage() {
    if (app.globalData.isNeedFenLei) {
      wx.navigateTo({
        url: '/pages/hall_food/hall_food'
      })
    } else {
      wx.navigateTo({
        url: '/pages/take_away/take_away'
      })
    }
  },
  // 跳转到支付界面
  jumpOrderPage: function () {
    let userInfo = app.globalData.userInfo;
    if (!userInfo || !userInfo.nickName) {
      wx.showToast({
        icon: 'none',
        title: '请去个人中心先登录',
      })
      return;
    }
    wx.navigateTo({
      url: '/pages/pay2/pay2'
    })
  },


})