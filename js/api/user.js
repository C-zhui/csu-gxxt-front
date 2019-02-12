define(['api/apiobj', 'config/global'], function (api, g) {
    api.user = {
        getInfo: function () {
            return g.post_query('/user/getInfo');
        },
        changePwd: function (id, pwd) {
            return g.post_json('/user/changePwd',
                [{
                    id: id,
                    pwd: pwd
                }]
            );
        }
    }
})