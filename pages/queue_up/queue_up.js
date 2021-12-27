const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({
  data: {
    array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    index: 0,
    myxiaozhuonum: 0,
    mydazhuonum: 0
  },
  onLoad() {
    let num = wx.getStorageSync('renshu') 
    // 获取就餐人数
    if (num > 0) {
      this.setData({
        index: num
      })
    }
    this.getMyQueueInfo()
  },
  // 从1-10给定的选择中选择就餐人数
  
  getUsersNum(e) {
    this.setData({
      index: e.detail.value
    })
  },
  // 如果需要重新排号
  queueAgain() {
    // 将大小桌号都回初始化
    this.setData({
      myxiaozhuonum: 0,
      mydazhuonum: 0
    })
  },
  // 排号
  Queue(e) {
    let type = e.currentTarget.dataset.type // 1为小桌，2为大桌
    let num = this.data.array[this.data.index] // 获取就餐人数
    // 记录和保存就餐人数
    console.log('就餐人数', num)
    console.log('就餐人数', 5 <= num <= 10)
    wx.setStorageSync('renshu', num) 
    // 实际只有等于0情况
    if (num <= 0) {
      wx.showToast({
        icon: 'none',
        title: '请选择就餐人数',
      })
      return
      // 小桌人数选大桌，给出错误提示信息
    } else if (num < 5 && type == 2) {
      wx.showToast({
        icon: 'none',
        title: '1-4人只能排小桌',
      })
      return
      // 同理大桌不能选小桌
    } else if (num >= 5 && num <= 10 && type == 1) {
      wx.showToast({
        icon: 'none',
        title: '5-10人请排大桌',
      })
      return
    }
    // 查询今日排号信息
    wx.cloud.callFunction({
        name: 'queueUp',
        data: {
          action: 'today',
          id: app._getNianYuiRi() // 获取日期信息
        }
      })
      .then(res => {
        console.log('查询成功', res)
        this.addQueueInfo(type, res.result.data) // 插入排号信息
      }).catch(res => {
        console.log('查询失败', res)
        this.addQueueInfo(type, null)
      })
  },
  // 数据库实时更新排号信息，在云端可以展示
  addQueueInfo(type, paihaoInfo) {
    let dataObj = {}
    if (paihaoInfo) { // 已有人排号
      wx.cloud.callFunction({
          name: 'paihao',
          data: {
            action: 'user',
            id: paihaoInfo._id,
            type: type
          }
        })
        .then(res => {
          console.log('更新添加成功', res)
          this.getMyQueueInfo()
        }).catch(res => {
          console.log('更新添加失败', res)
        })
    } else { //今日不存在排号数据
      dataObj = {
        // 初始化排号都为1
        _id: app._getNianYuiRi(),
        xiaozhuo: type == 1 ? [app.globalData.openid] : [],
        dazhuo: type == 2 ? [app.globalData.openid] : [],
        xiaozhuonum: 1,
        dazhuonum: 1
      }
      db.collection('paihao')
        .add({
          data: dataObj
        }).then(res => {
          console.log('添加成功', res)
          this.getMyQueueInfo()
        }).catch(res => {
          console.log('添加失败', res)
        })
    }

  },

  //查看自己的排号信息
  getMyQueueInfo() {
    wx.cloud.callFunction({
        name: 'paihao',
        data: {
          action: 'today',
          id: app._getNianYuiRi()
        }
      }).then(res => {
        console.log('获取排号信息成功', res)
        if (res.result&&res.result.data) {
          let paihao = res.result.data
          let myxiaozhuonum = paihao.xiaozhuo.lastIndexOf(app.globalData.openid)
          let mydazhuonum = paihao.dazhuo.lastIndexOf(app.globalData.openid)
          console.log('myxiaozhuonum', myxiaozhuonum)
          console.log('mydazhuonum', mydazhuonum)
          this.setData({
            xiaozhuonum: paihao.xiaozhuonum,
            dazhuonum: paihao.dazhuonum,
            myxiaozhuonum: myxiaozhuonum > -1 ? myxiaozhuonum + 1 : 0,
            mydazhuonum: mydazhuonum > -1 ? mydazhuonum + 1 : 0
          })
        }
      })
      .catch(res => {
        console.log('获取排号信息失败', res)
      })
  },
  // 排号时可以下单，此处获取订单信息
  getorder(){
    wx.cloud.database().collection("order")
   .get()
      .then(res=>{
        console.log("制作完成订单",res)
        this.setData({
          goodlist:res.data,
        })
      }).catch(res => {
        console.log("订单数据请求失败", res)
      })
  }


})