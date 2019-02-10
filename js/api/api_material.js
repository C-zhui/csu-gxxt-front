var api_material = {
    // 获取所有物料
    getAllMaterial: function () {
        return post_query(
            '/material/getAllMaterial',
            {}
        )
    },
    // 添加一种新的物料
    addPurchase:function (num,clazz) {
        return post_query(
            '/material/addMaterial',
            {
                "num":num,
                "clazz":clazz
            }
        )
    },
    // 删除一种物料
    deletePurchase:function (clazz) {
        return post_query(
            '/material/deleteMaterial',
            {
                "clazz":clazz
            }
        )
    }
}