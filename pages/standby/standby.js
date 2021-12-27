let app = getApp();
const db = wx.cloud.database()
var lzy="hhh"
Page({
  data: { //页面的初始数据   
    standbyname:"",
    payWayList: [ {
      "id": 1,
      "package": "微信支付"
    }, {
      "id": 2,
      "package": "银行卡支付"
    }],
    totalPrice: 9.9, //总价
    maskFlag: true, // 遮罩
  },
  onLoad() {
    console.log('standby_name', app.globalData.userInfo.nickName)
    console.log("lzy",lzy)
    this.setData({
      standbyname: app.globalData.userInfo.nickName
    })   
    this.setData({
      totalPrice: this.data.totalPrice,
   
    })
  },

  //打开支付方式弹窗
  choosePayWay() {
    var that = this;
    var rd_session = wx.getStorageSync('rd_session') || [];

    // 支付方式打开动画
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
    that.setData({
      maskFlag: false,
    });
  },
  // 支付方式关闭方法
  closePayWay() {
    var that = this
    // 支付方式关闭动画
    that.animation.translate(0, 285).step();
    that.setData({
      animationData: that.animation.export()
    });
    that.setData({
      maskFlag: true
    });
  },


  //提交订单
  submitOrder: function (e) {
    let id = this.data.id
    db.collection("vip")
    .where({
        name:this.data.standbyname
    })
   .get()
      .then(res=>{
        if(res.data.length!=0){
            console.log("您已是会员，续费成功",res.data[0])
            
          var getwhat = res.data.shift()
          
        
        db.collection("vip").doc(getwhat._id).update(
                {data:{
                  time:getwhat.time+2626560000
                }
                }).then(res => {
                    console.log("支付成功", res)
                    // 支付方式关闭动画
                    this.animation.translate(0, 285).step();
                    this.setData({
                      animationData: this.animation.export()
                    });
                    this.setData({
                      maskFlag: true
                    });
                    wx.showToast({
                      title: '续费成功！',
                    })
               
              
                  }).catch(res => {
                    wx.showToast({
                      icon: 'none',
                      title: '支付失败',
                    })
                    console.log("支付失败", res)
                  }
      )}
    else{
        console.log("您还不是会员，现在您是会员了", res.name)
        db.collection("vip").add({
            data:{
            name:this.data.standbyname,
            time:new Date().getTime()+2626560000,
            _createTime: new Date().getTime() //创建的时间
            }
        }).then(res => {
            console.log("支付成功", res)
            // 支付方式关闭动画
            this.animation.translate(0, 285).step();
            this.setData({
              animationData: this.animation.export()
            });
            this.setData({
              maskFlag: true
            });
            wx.showToast({
              title: '开通成功！',
            })
       
      
          }).catch(res => {
            wx.showToast({
              icon: 'none',
              title: '支付失败',
            })
            console.log("支付失败", res)
          }
      )

  
  }
}    
      ).catch(res => {
       console.log("有bug",res)


})
}})
