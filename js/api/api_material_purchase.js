var api_material_purchase = {

    // 入库***************************************
    // 获取入库记录
    getSaveBy5:function (postdata) {
        return post_json(
            '/save/getSaveBy5',
            postdata
        )
    },
    // 增加入库记录
    addSave:function (postdata) {
        // console.log("233")
        return post_json(
            '/save/add',
            postdata
        )
    },

}