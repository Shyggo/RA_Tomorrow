//JS
var app = getApp()
let db = wx.cloud.database()
Page({
  data: {
    // 全部评价和我的评价分类
    navbar: ['全部评价', "我的评价"],
    currentTab: 0,
    list: [] // 存储每条评价
  },
  // 切换顶部标签
  navbarTap: function (e) {
    let index = e.currentTarget.dataset.idx;
    this.setData({
      currentTab: index
    })
    if (index == 1) {
      this.getAllMyComment();
    } else {
      this.getEveryoneComment();
    }
  },
  onLoad() {
    this.getEveryoneComment();
  },
  // 查询所有评论列表
  getEveryoneComment() {
    wx.cloud.callFunction({
      name: "getComment",
    })
    .then(res => {
      console.log("查询全部评论成功", res)
      if (res && res.result) {
        let dataList = res.result.data;
        this.setData({
          list: dataList
        })
      } else {
        this.setData({
          list: []
        })
      }
    }).catch(res => {
      console.log("查询全部评论失败", res)
    })
  },

  // 查询顾客自己评价
  getAllMyComment() {
    let that = this;
    // 获取当前用户的openid定位到评论
    db.collection("pinglun").get()
      .then(res => {
        console.log("查询评论成功", res)
        if (res && res.data) {
          let dataList = res.data;
          that.setData({
            list: dataList
          })
        } else {
          that.setData({
            list: []
          })
        }
      }).catch(res => {
        console.log("查询评论失败", res)
      })
  },
})