// 经理的管理界面
const app = getApp()
// 定义变量存储账号，密码，薪水，职位
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
    // 跳转回退至管理员界面
    jumpManager() {
        wx.navigateTo({
          url: '/pages/admin_manager/admin_manager',
        })
      },
    inputAccount(input) { // 账号
        this.setData({
          name: input.detail.value
        })
      },
    inputPassWord(input) { // 密码
        this.setData({
          password: input.detail.value
        })
    },
    inputSalary(input) { // 薪水
        this.setData({
          salary: input.detail.value
        })
    },
    getData:function(e){
      this.setData({
        position: e.detail
      })
    },
    
      // 提交更改信息
    submitChange:function() { 
        let id = this.data.id
        let name = this.data.name
        let password = this.data.password
        let salary =this.data.salary
        let position = this.data.position
        // 提示某项信息输入为空
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
        db.collection("admin").where({
            _id:id,
            name:name
        })
        // 提交时，更新数据库数据信息
        .update({
            data: {
                password:password,
                salary:salary,
                position:position
              }
        }).then(res => {
            console.log("修改成功", res)
            wx.showToast({
              title: '修改成功',
            })
            this.jumpManager()
          }).catch(res => {
            console.log("修改失败", res)
            wx.showToast({
              icon: "none",
              title: '修改失败',
            })
          })
    
    
      },
    
})