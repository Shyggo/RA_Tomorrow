// 实现店铺定位的页面
Page({
  data: {
    // 声明店铺的经纬度位置
    latitude: 39.10231,
    longitude: 117.17127,
    // 标记属性
    markers: [{
      id: 0,
      name: "南开一食堂",
      address: "南开一食堂",
      latitude: 39.10231,
      longitude: 117.17127,
      width: 50,
      height: 50
    }]

  },
  // 显示电话号，拨打
  phoneCallFunc() {
    wx.makePhoneCall({
      phoneNumber: '13522918897' 
    })
  },
  // 复制输入的微信（手机号）
  getWeChatFunc() {
    wx.setClipboardData({
      data: '13522918897', // 此处暂存编者卢紫宇的手机号
    })
  },
  // 根据经纬度属性的导航信息展示
  locationShowerFunc(event) {
    console.log(event)
    // 获取位置信息
    wx.getLocation({ 
      type: 'wgs84', 
      success: function (res) {
        // 使用微信内置的函数调用展示位置信息
        wx.openLocation({ 
          latitude: event.currentTarget.dataset.marker.latitude, // 纬度
          longitude: event.currentTarget.dataset.marker.longitude, // 经度
          name: event.currentTarget.dataset.marker.name, // 店名
          address: event.currentTarget.dataset.marker.address // 地址
        })
      },
      // 考虑调用失败打印错误信息
      fail: res => {
        console.log('授权失败', res)
        wx.showModal({
          title: '需要授权位置信息',
          success: res => {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  }
})