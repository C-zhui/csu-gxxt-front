require(['jquery','config/global','util/md5'], function ($,g) {

  $(function () {
    // 查询基本信息并显示
    getBasicInfo();
  })

  // 修改密码
  $('#change_password_submit').click(changePassword);
  function changePassword() {
    let old_password = $('#old_password').val();
    old_password = hex_md5(old_password);
    let new_password = $('#new_password').val();
    new_password = hex_md5(new_password);
    $.ajax({
      type: 'post',
      async: false,
      url: g.base_url + '/user/changePwd2',
      datatype: 'json',
      xhrFields: {withCredentials: true},
      crossDomain: true,
      data: {
        'old': old_password,
        'pwd': new_password
      },
      success: function (data) {
        console.log(data);
        if (data.status === 0) {
          console.log(data);
          swal(
            '修改成功',
            '修改密码成功！',
            'success'
          );
        } else {
          swal(
            '修改失败',
            String(data.message),
            'error'
          );
        }
      }
    });
  }

  // 查询基本信息并显示
  function getBasicInfo() {
    $.ajax({
      url: g.base_url + '/user/getInfo',
      type: 'post',
      datatype: 'json',
      data: {},
      xhrFields: {withCredentials: true},
      crossDomain: true,
      success: function (data) {
        console.log(data);
        if (data.status === 0) {
          console.log(data);
          var teacherGroupOrClass;
          if (data.data["教师组"]) {
            $("#userId").html("教师组");
            teacherGroupOrClass = data.data["教师组"];
          } else {
            $("#userId").html("班级")
            teacherGroupOrClass = data.data["班级"];
          }
          let name = data.data["姓名"];
          console.log(teacherGroupOrClass);
          console.log(name);
          $('#teacherGroupInfo').val(teacherGroupOrClass);
          $('#teacherNameInfo').val(name);
        }
      }
    });
  }
});
