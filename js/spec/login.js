define(['jquery', 'swal', 'config/global', 'api/apiobj', 'api/user', 'util/md5',], function ($, swal, g, api) {
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
                //获取用户基本信息使用local storage存储
                api.user.getInfo().done(function (temp) {
                    // if (temp.status === 0) {
                        localStorage.setItem('user', JSON.stringify(temp.data));
                        window.location.href = './a-index.html?' + data.data["身份"]
                    // }
                    // else{
                    //     localStorage.removeItem('user');
                    //     swal(
                    //         '登录失败',
                    //         "登录失败，请待会再试！",
                    //         'error'
                    //     );
                    // }
                });
            } else {
                console.log(data);
                localStorage.removeItem('user');
                swal(
                    '登录失败',
                    String(data.message),
                    'error'
                );
            }
        }).fail(g.net_err).fail(function () {
            localStorage.removeItem('user');
        })
    });
});
