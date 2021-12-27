// 前台（管理排号信息）页面展示
const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    xiaozhuonum: 0,
    dazhuonum: 0,
    xiaozhuoAll: 0,
    dazhuoAll: 0
  },
  onLoad() {
    this.getQueueNum()
    this.getUserOrder()
  },
  // 呼叫排号中下一号
  callNext(e) {
    let type = e.currentTarget.dataset.type // 桌型变量
    wx.cloud.callFunction({
        name: 'queueUp',
        data: {
          action: 'admin',
          id: app._getNianYuiRi(),
          type: type // 1类为小桌，2类为大桌
        }
      })
      // 反应更新是否成功信息
      .then(res => {
        console.log('更新成功', res)
        this.getQueueNum()
      }).catch(res => {
        console.log('更新失败', res)
      })
  },
  
  // 获取排号信息
  getQueueNum() {
    db.collection('paihao').doc(app._getNianYuiRi()).get()
      .then(res => {
        console.log('获取排号信息成功', res)
        if (res.data) {
          let paihao = res.data
          // 获取res的数据，分别获取小桌和大桌的排号信息
          this.setData({
            xiaozhuonum: paihao.xiaozhuonum,
            dazhuonum: paihao.dazhuonum,
            xiaozhuoAll: paihao.xiaozhuo.length,
            dazhuoAll: paihao.dazhuo.length
          })
        }
      })
      .catch(res => {
        console.log('获取排号信息失败', res)
      })
  },
  // 获取用户订单
  getUserOrder(){
    wx.cloud.database().collection("order")
    .where({
      status:0
    })
   .get()
      .then(res=>{
        console.log("制作完成订单",res)
        this.setData({
          goodlist:res.data,
        })
      }).catch(res => {
        console.log("订单数据请求失败", res)
      })
  },
})