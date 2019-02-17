define(['api/apiobj','config/global'], function (api,g) {
// 物料申购
    api.applyFPchse = {
    // 按条件查询各类权限的所有老师名字
    getAllNameByAuthType: function (auth) {
        return g.post_query(
            '/applyFPchse/getAllNameByAuthType',
            {'type':auth}
        )
    },
    // 申购***************************************
    // 获取所有申购记录
    getAllApplyFPchse:function () {
        return g.post_query(
            '/applyFPchse/getAllApplyFPchse',
            {}
        )
    },
    // 根据条件查询申购记录
    getSelectedPurchase:function (postdata) {
        return g.post_query(
            '/applyFPchse/getSelectedPurchase',
            postdata
        )
    },
    // 生成申购单
    downloadApply:function(data) { // data 是 二维的字符串数组
        g.downloads("/applyFPchse/ExcelDownloads","POST",JSON.stringify(data.purchase_ids))
    },
    // 新增一条物料申购
    addApplyFPchse:function (post_data) {
        return g.post_query(
            '/applyFPchse/addApplyFPchse',
            post_data
        )
    },
    // 删除物料申购记录
    deleteApplyFPchse:function (purchase_id) {
        return g.post_query(
            '/applyFPchse/deleteApplyFPchse',
            {
                'purchase_id':purchase_id
            }
        )
    },
    // 物料申购审核
    applyVerify:function (postdata) {
        return g.post_query(
            '/applyFPchse/ApplyVertify',
            postdata
        )
    },

}
});