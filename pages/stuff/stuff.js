const app = getApp()
let name = ""
let password = ""
let position = ""
const db = wx.cloud.database()
Page({
  data: {
    isAdmin: false,
    selectArray: [{
      "id": "1",
      "text": "经理"
    }, {
      "id": "2",
      "text": "后厨"
    },{
      "id": "3",
      "text": "前台"
    },{
      "id": "4",
      "text": "保洁"
    }
  ],
  },

  // 跳转到后厨页面
  jumpCook() {
    wx.navigateTo({
      url: '/pages/admin_kitchen/admin_kitchen',
    })
  },
  // 跳转到清洁工页面
  jumpCleaner() {
    wx.navigateTo({
      url: '/pages/cleaner/cleaner',
    })
  },
  // 跳转到经理页面
  jumpManager() {
    wx.navigateTo({
      url: '/pages/admin_manager/admin_manager',
    })
  },
  // 跳转到前台页面
  jumpStage() {
    wx.navigateTo({
      url: '/pages/admin_queue_up/admin_queue_up',
    })
  },

  onLoad() {
    let admin = wx.getStorageSync('admin')
    if (admin && admin.name && admin.password) {// 登录时校验
      this.login(admin.name, admin.password)
    }
  },
  // 界面获取信息管理员相关信息
  getName: function (e) {
    name = e.detail.value
  },

  getPassWord: function (e) {
    password = e.detail.value
  },

  getData:function(e){
    position = e.detail
  },

  // 输入格式规范检查
  formSubmit: function () {
    if (name == '' || name == undefined) {
      wx.showToast({
        title: '用户名不能为空',
        icon: 'none'
      })
      return;
    }
    if (password == '' || password == undefined) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return;
    }
    this.login(name, password,position)
  },

  // 展示登录信息，并且根据position职位属性跳转到不同职位的管理页面
  login(name, password,position) {
    db.collection('admin').where({
        name: name,
        password: password,
        position:position
      }).get()
      .then(res => {
        console.log("登陆成功", res)
        if (res.data && res.data.length > 0) {
          this.setData({
            isAdmin: true
          })
          let admin = {
            name: "",
            password: "",
            position: ""
          }
          wx.setStorageSync('admin', admin)
          if(position=="后厨"){
            this.jumpCook()
          }else if(position=="经理"){
            this.jumpManager()
          }else if(position=="前台"){
            this.jumpStage()
          }else if(position=="保洁"){
            this.jumpCleaner()
          }
        } else {
          this.setData({
            isAdmin: false
          })
          wx.showToast({
            icon: 'none',
            title: '账号或密码错误',
          })
        }
      }).catch(res => {
        console.log("登陆失败", res)
        wx.showToast({
          icon: 'none',
          title: '账号或密码错误',
        })
        this.setData({
          isAdmin: false
        })
      })
    }
})