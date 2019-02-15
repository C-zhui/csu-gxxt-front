define(['api/apiobj', 'config/global'], function (api, g) {

    // 采购报账
    api.reim = {
        // 查询采购报账记录
        getRemi: function (postdata) {
            return g.post_json(
                '/reim/getReim',
                postdata
            )
        },
        // 新增报账记录
        addRemi: function (postdata) {
            return g.post_json(
                '/reim/add',
                postdata
            )
        },
        // 报账单
        downloadReims: function (postdata) {
            g.downloads("/reim/downloadReim","POST",JSON.stringify(postdata.reimIds))
        },
        // 删除报账
        deleteRemi: function (ids) {
            console.log(233)
            return g.post_json(
                '/reim/delete',
                ids
            )
        },
        // 修改报账 接口还有问题**********************************
        remiVerify: function (postdata) {
            return g.post_query(
                '/reim/verify',
                postdata
            )
        },

    }
});