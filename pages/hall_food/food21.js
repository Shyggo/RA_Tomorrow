// 点单页面展示
let app = getApp();
const db = wx.cloud.database({});
let windowHeight = 0
Page({
  data: {
    cartList: [], // 购物车
    totalPrice: 0, // 总价，初始为0
    totalNum: 0, //总数，初始为0
    // 购物车动画
    animationData: {},
    animationMask: {},
    maskVisual: "hidden",
    maskFlag: true,
    // 分类相关
    menuArr: [],
    leftActiveNum: 0,
    Tab: 0,
    heightArr: [],//用来存储右侧每个条目的高度
    banner: [{
      picUrl: '/image/1.jpg'
    },
    {
      picUrl: '/image/2.jpg'
    }, {
      picUrl: '/image/3.jpg'
    }
  ],
  flag:false,//有没有在这吃过饭
  orderarr:[]

  },

  
  // 点单页面轮播图，大图展示菜品
  getTopBanner() {
    wx.cloud.database().collection("lunbotu")
      .get()
      .then(res => {
        console.log("首页banner成功", res.data)
        if (res.data && res.data.length > 0) {
          // default
          this.setData({
            banner: res.data
          })
        }
      }).catch(res => {
        console.log("首页banner失败", res)
      })
  },
  onLoad(e) {
    let arrNew=[]
    db.collection("order").where({
      name:app.globalData.userInfo.nickName
    }).get()
    .then(
      res=>{
        if(res.data.length!=0){
          console.log("yes",res.data[res.data.length-1])
          
          res.data[res.data.length-1].orderList.forEach(item=>{
          arrNew.push(item)
          })
          this.setData({
            flag:true,
            orderarr:arrNew
          })
        }
      }
    )
    if (e.searchKey) {
      //搜索菜品
      this.getFoodList('search', e.searchKey)
    } else {
      //获取菜品数据
      this.getFoodList('getAll')
    }

  },
  // 获取菜品数据
  getFoodList(action, searchKey) {
    // 购物车中所有菜品信息载入
    let cartList = wx.getStorageSync('cart') || [];
    wx.cloud.callFunction({
      name: "getFoodList",
      data: {
        action: action,
        searchKey: searchKey
      }
    }).then(res => {
      let dataList = res.result.data;
      console.log("菜品数据", res)
      // 购买数量
      dataList.forEach(food => {
        food.quantity = 0;
        cartList.forEach(cart => {
          if (cart._id == food._id) {
            food.quantity = cart.quantity ? cart.quantity : 0;
          }
        })
      });
      // 分类
      let tempArr = [];
      let endData = [];
      dataList.forEach(item => {
        if (tempArr.indexOf(item.fenlei) === -1) {
          endData.push({
            title: item.fenlei, // 数据库中存了分类信息
            list: [item]
          });
          tempArr.push(item.fenlei);
        } else {
          for (let j = 0; j < endData.length; j++) {
            if (endData[j].title == item.fenlei) {
              endData[j].list.push(item);
              break;
            }
          }
        }
      })
      // 添加菜品id，去重
      endData.map((item, index) => {
        item.id = index
      })
      console.log('过滤后', endData)
      this.setData({
        cartList: cartList,
        menuArr: endData,
      })
      this.getPriceAndNum()
      this.getHeightArr()
    }).catch(res => {
      console.log("菜品数据请求失败", res)
    })
  },

  // 减少购物车中单个菜品数量
  minusDishNum(e) {
    let item = e.currentTarget.dataset.item;
    let cartList = wx.getStorageSync('cart') || [];
    let menuArr = this.data.menuArr
    menuArr.forEach(v => {
      v.list.forEach(v2 => {
        if (v2._id == item._id) {
          if (v2.quantity && v2.quantity > 0) {
            v2.quantity -= 1;
          } else {
            v2.quantity = 0;
          }
          if (cartList.length > 0) {
            for (let j in cartList) {
              if (cartList[j]._id == item._id) {
                cartList[j].quantity ? cartList[j].quantity -= 1 : 0
                if (cartList[j].quantity <= 0) {
                  // 考虑单到菜品数量减至0，直接删除改菜品
                  this.removeByDish(cartList, item._id)
                }
                if (cartList.length <= 0) {
                  this.setData({
                    cartList: [],
                    totalNum: 0,
                    totalPrice: 0, // 归零设置
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
        }
      })
    })
    this.setData({
      cartList: cartList, // 此处可能重新更新购物车列表
      menuArr: menuArr
    })
    this.getPriceAndNum();
  },
  // 删除单项菜品
  removeByDish(array, id) {
    for (var i = 0; i < array.length; i++) {
      if (array[i]._id == id) {
        array.splice(i, 1);
        break;
      }
    }
  },

  // 增加购物车中单个菜品数量
  addDishNum(e) {
    let item = e.currentTarget.dataset.item;
    let arr = wx.getStorageSync('cart') || [];
    let ifFound = false;
    let menuArr = this.data.menuArr
    // 找到被点击的菜品
    menuArr.forEach(v => { 
      v.list.forEach(v2 => {
        if (v2._id == item._id) {
          v2.quantity += 1;
          if (arr.length > 0) {
            // 被点击的菜品数量设置+1
            for (let j in arr) { 
              if (arr[j]._id == item._id) {
                arr[j].quantity += 1; // 更新数量
                ifFound = true;
                try {
                  wx.setStorageSync('cart', arr)
                } catch (e) {
                  console.log(e)
                }
                break;
              }
            }
            if (!ifFound) {
              arr.push(v2);
            }
          } else {
            arr.push(v2);
          }
          try {
            wx.setStorageSync('cart', arr)
          } catch (e) {
            console.log(e)
          }
          // break;
        }
      })

    })

    this.setData({
      cartList: arr,
      menuArr: menuArr
    })
    this.getPriceAndNum();
  },


  // 获取菜品总价格和数量
  getPriceAndNum() {
    var cartList = this.data.cartList; // 获取购物车列表
    var dishPrice = 0;
    var dishNum = 0
    // 从列表中得到全部数据相加（价格和数量）
    for (var i in cartList) { 
      dishPrice += cartList[i].quantity * cartList[i].price;   
      dishNum += cartList[i].quantity
    }
    this.setData({ // 最后赋值到data中渲染到页面
      cartList: cartList,
      totalNum: dishNum,
      totalPrice: dishPrice.toFixed(2)-Math.floor(dishPrice.toFixed(0)/50)*5
    });
  },
  // 清空购物车
  cleanCart(e) {
    let menuArr = this.data.menuArr
    menuArr.forEach(v => {
      v.list.forEach(v2 => {
        v2.quantity = 0
      })
    })
    try {
      wx.setStorageSync('cart', "")
    } catch (e) {
      console.log(e)
    }
    this.setData({
      menuArr: menuArr,
      cartList: [],
      totalNum: 0,
      totalPrice: 0,
    })
    this.cascadeDismiss()
  },

  //删除购物车单项
  deleteByDish(e) {
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var arr = wx.getStorageSync('cart')
    let menuArr = this.data.menuArr
    menuArr.forEach(v => {
      v.list.forEach(v2 => {
        if (v2._id == id) {
          v2.quantity = 0;
        }
      })
    })
    // 删除单项
    arr.splice(index, 1);
    if (arr.length <= 0) {
      this.setData({
        menuArr: menuArr,
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
      menuArr: menuArr
    })
    this.getPriceAndNum() // 删除后重新更新总价和总数信息
  },
  // 购物车状态切换
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
  // 购物车进入的相关动画展示
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
  // 购物车退出的相关动画展示
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
  // 跳转至订单页面
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
        showCancel: false, //去掉取消按钮
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
      url: '/pages/pay_in_canteen/pay_in_canteen'
    })


  },

  // 获取窗口高度
  getHeightArr() {
    let _this = this;
    // 获得以rpx单位为标准的窗口高度
    wx.getSystemInfo({
      success: function (res) {
        windowHeight = (res.windowHeight * (750 / res.windowWidth)); // 高度乘上换算比例
        console.log("windowHeight", windowHeight) 
      }
    })
    // 获取每道菜（所占块）距离顶端高度，存入数组，目前的区域可以通过高度和scrollTop对比得知
    let heightArr = [];
    let h = 0;
    const query = wx.createSelectorQuery(); // 选择结点，结点为分类的交界点
    // 节点选择
    query.selectAll('.rightblock').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      // 累加高度，做对比
      res[0].forEach((item) => {
        h += item.height;
        heightArr.push(h);
      })
      _this.setData({
        heightArr: heightArr
      })
    })
    console.log("heightArr", heightArr)

  },

  //点击左侧栏目
  clickSort(e) {
    this.setData({
      leftActiveNum: e.target.dataset.myid,
      Tab: e.target.dataset.myid
    })
    console.log('点击了')
  },

  //右侧滚动时触发这个事件
  matchScroll(e) {
    let wucha = 15 //避免部分机型上有问题，给出一个误差范围
    let st = e.detail.scrollTop;
    let myArr = this.data.heightArr;
    // console.log("st", st)
    // console.log("myArr", myArr)
    for (let i = 0; i < myArr.length; i++) {
      //找出是滚动到了第一个栏目，然后设置栏目选中状态
      if (st >= myArr[i] && st < myArr[i + 1] - wucha) {
        console.log("找到的i", i)
        this.setData({
          leftActiveNum: i + 1
        });
        return;
      } else if (st < myArr[0] - wucha) {
        this.setData({
          leftActiveNum: 0
        });
      }

    }
  },
  latestorder(){
    let arr = wx.getStorageSync('cart') || [];
    let f = false;
    let menuArr = this.data.menuArr
    db.collection("order").where({
      name:app.globalData.userInfo.nickName
    }).get()
    .then(res=>{
    res.data[res.data.length-1].orderList.forEach(
      item=>{
    menuArr.forEach(v => { // 遍历菜单找到被点击的菜品，数量加1
      v.list.forEach(v2 => {
        
        if (v2._id == item._id) {
          v2.quantity += item.quantity;
          if (arr.length > 0) {
            for (let j in arr) { // 遍历购物车找到被点击的菜品，数量加1
              if (arr[j]._id == item._id) {
                arr[j].quantity += item.quantity;
                f = true;
                try {
                  wx.setStorageSync('cart', arr)
                } catch (e) {
                  console.log(e)
                }
                break;
              }
            }
            if (!f) {
              arr.push(v2);
            }
          } else{
            arr.push(v2);
          }
          try {
            wx.setStorageSync('cart', arr)
          } catch (e) {
            console.log(e)
          }
          // break;
        }
      })

    })

    this.setData({
      cartList: arr,
      menuArr: menuArr
    })
    this.getPriceAndNum();
  })})
}
})