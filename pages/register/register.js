// 管理员为员工注册界面
const app = getApp()
let name = ""
let password = ""
let position = ""
let salary = ""
const db = wx.cloud.database()
Page({
  data: {
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
    // 跳转至管理员界面
    goManager() {
        wx.navigateTo({
          url: '/pages/admin_manager/admin_manager',
        })
      },
    getInputAccount(input) { // 获取输入的账号
        this.setData({
          name: input.detail.value
        })
      },
    getInputPwd(input) { // 获取输入的密码
        this.setData({
          password: input.detail.value
        })
    },
    getInputSalary(input) { // 获取输入的薪水
        this.setData({
          salary: input.detail.value
        })
    },
    getData:function(e){
      this.setData({
        position: e.detail
      })
    },
  
    
      // 更新数据库的评论数据
    updateData:function() {
        let name = this.data.name
        let password = this.data.password
        let salary =this.data.salary
        let position = this.data.position
        if (!name||!password||!salary||!position) {
            wx.showToast({
              title: '内容为空',
            })
            return;
          }
        let openid = app._checkOpenid();
        if (!openid) {
          return;
        }
        db.collection("admin").add({
            data: {
                name: name,
                password:password,
                salary:salary,
                position:position
              }
        }).then(res => {
            console.log("评论成功", res)
            wx.showToast({
              title: '评论成功',
            })
            this.goManager()
          }).catch(res => {
            console.log("评论失败", res)
            wx.showToast({
              icon: "none",
              title: '评论失败',
            })
          })
    
    
      },
    
})