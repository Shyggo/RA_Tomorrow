const app = getApp()
Page({

  onShow() {
    this.getTableCondition()
  },

  // 跳转到管理员界面（用于传达桌子清理完成信息）
  jumpAdminPage() {
    wx.navigateTo({
      url: '/pages/stuff/stuff',
    })
  },
  // 根据三张桌子的不同id分别写三张桌子的清理函数
  cleanFirstTable(){
    
    wx.cloud.database().collection("table")
    .where({
        _id:"fa4fe87261a6d8560139503a3197ea74"
    })
    .update({
        data:{
            status:"待使用" // 清理完毕，更新桌子状态
        }
    })
    wx.showToast({
      title: '清理完成',
    })
    wx.navigateTo({
      url: '/pages/cleaner/cleaner',
    })
    return;
  },
  cleanSecondTable(){
    
    wx.cloud.database().collection("table")
    .where({
        _id:"5026485b61a6d85c00fc64a52b0904f6"
    })
    .update({
        data:{
            status:"待使用"
        }
    })
    wx.showToast({
      title: '清理完成',
    })
    wx.navigateTo({
      url: '/pages/cleaner/cleaner',
    })
    return;
  },
  cleanThirdTable(){
    
    wx.cloud.database().collection("table")
    .where({
        _id:"908462d561a6d862011436b416e9a6ef"
    })
    .update({
        data:{
            status:"待使用"
        }
    })
    wx.showToast({
      title: '清理完成',
    })
    wx.navigateTo({
      url: '/pages/cleaner/cleaner',
    })
    return;
  },
  
  getTableCondition(){
    wx.cloud.database().collection("table")
    .get()
    // 和数据库中桌子状态交互
      .then(res=>{
        console.log("桌子状态",res)
        this.setData({
          tablelist:res.data,
        })
      }).catch(res => {
        console.log("桌子状态请求失败", res)
      })
  }

})