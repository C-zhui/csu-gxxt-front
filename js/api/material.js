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
        },
        //派出物料接口
        decrMaterialNum: function (num, clazz, sid, sname) {
            return g.post_query('/material/decrMaterialNum', {
                num: num,
                clazz: clazz,
                sid: sid,
                sname: sname
            });
        },
        //获取申请记录(注意区别申购记录,这个是学生的申请记录)
        getApplys: function (clazz, sid, sname, startTime, endTime) {
            return g.post_query('/material/getApplys', {
                clazz: clazz,
                sid: sid,
                sname: sname,
                startTime: startTime,
                endTime: endTime
            });
        }
    }

});