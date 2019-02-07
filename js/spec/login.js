define(['jquery', 'swal', 'config/global','util/md5'], function ($, swal, g) {
  $("#login_submit").click(function () {
    let username = $('#username').val();
    let password = $('#password').val();
    password = hex_md5(password);
    console.log(username);
    console.log(password);
    g.post_query(
      '/login',
      {
        'name': username,
        'password': password
      }
    ).done(function (data) {
      // console.log(data);
      if (data.status === 0) {
        // console.log(data);
        basicInfo = data.data;
        window.location.href = './a-index.html?'+data.data["身份"]
        // if (data.data["身份"] === "admin") {
        //   // window.location.href = './manager/iindex.html';
        //   window.location.href = 
        // }
        // else if (data.data["身份"] === "teacher") {
        //   window.location.href = 
        // }
        // else if (data.data["身份"] === "student") {
        //   window.location.href = 
        // }
      }
      else {
        console.log(data);
        swal(
          '登录失败',
          String(data.message),
          'error'
        );
      }
    }).fail(g.net_err);
  });
});
