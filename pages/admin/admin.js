const app = getApp()
let name = ""
let password = ""
let position = ""
const db = wx.cloud.database()
Page({
  data: {
    isAdmin: false,
  },
  //去后厨管理页
  goHouchu() {
    wx.navigateTo({
      url: '/pages/adminHouchu/adminHouchu',
    })
  },
  //去经理管理页
  goManager() {
    wx.navigateTo({
      url: '/pages/adminManager/adminManager',
    })
  },
  //去排号（前台）管理页
  goPaihao() {
    wx.navigateTo({
      url: '/pages/adminPaihao/adminPaihao',
    })
  },
  onLoad() {
    let admin = wx.getStorageSync('admin')
    if (admin && admin.name && admin.password) {
      //每次进入管理页都校验账号密码，防止离职员工登录
      this.login(admin.name, admin.password)
    }
  },
  //管理员登陆相关
  getName: function (e) {
    name = e.detail.value
  },

  getPassWord: function (e) {
    password = e.detail.value
  },

  getPosition: function (e) {
    position = e.detail.value
  },
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
  //登录
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
            this.goHouchu()
          }else if(position=="经理"){
            this.goManager()
          }else if(position=="前台"){
            this.goPaihao()
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