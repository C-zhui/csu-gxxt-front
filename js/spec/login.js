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
      if (data.status === 0) {
        basicInfo = data.data;
        window.location.href = './a-index.html?'+data.data["身份"]
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
