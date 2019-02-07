define(['api/apiobj', 'config/global'], function (api, g) {

    // 入库
     api.save = {
        // 获取入库记录
        getSaveBy5: function (postdata) {
            return g.post_json(
                '/save/getSaveBy5',
                postdata
            )
        },
        // 增加入库记录
        addSave: function (postdata) {
            // console.log("233")
            return g.post_json(
                '/save/add',
                postdata
            )
        },
    }

});