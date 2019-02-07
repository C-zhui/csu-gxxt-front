define(['api/apiobj', 'config/global'], function (api, g) {

     api.material = {
        // 获取所有物料
        getAllMaterial: function () {
            return g.post_query(
                '/material/getAllMaterial',
                {}
            )
        },
        // 添加一种新的物料
        addPurchase: function (num, clazz) {
            return g.post_query(
                '/material/addMaterial',
                {
                    "num": num,
                    "clazz": clazz
                }
            )
        },
        // 删除一种物料
        deletePurchase: function (clazz) {
            return g.post_query(
                '/material/deleteMaterial',
                {
                    "clazz": clazz
                }
            )
        }
    }

});