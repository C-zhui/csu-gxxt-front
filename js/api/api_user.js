// 获取用户信息
var api_user = {
    // 按条件查询各类权限的所有老师名字
    getInfo: function () {
        return post_query(
            '/user/getInfo',
            {}
        )
    }
}