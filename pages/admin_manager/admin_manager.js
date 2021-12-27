const app = getApp()
Page({
 
  onShow() {
    this.getManagerInfo(),
    this.getHotFood() //获取热门菜品
    
  },
  // 跳转至注册页面
  jumpRegisterPage() {
    wx.navigateTo({
      url: '/pages/register/register',
    })
  },
  // 跳转至管理账号密码界面
  jumpEditPage() {
    wx.navigateTo({
      url: '/pages/edit/edit',
    })
  },
  // 获取热门菜品推荐
  getHotFood() {
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
  // 获取管理员信息
  getManagerInfo(){
    wx.cloud.database().collection("admin").get() 
      .then(res=>{
        console.log("人员名单",res)
        this.setData({
          peoplelist:res.data,
        })
      }).catch(res => {
        console.log("人员数据请求失败", res)
      })
  }

})