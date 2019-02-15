define(['api/apiobj', 'config/global'], function (api, g) {
    // 采购
    api.purchase = {
        // 查询采购记录
        getPurchase: function (postdata) {
            return g.post_query(
                '/purchase/getPurchase',
                postdata
            )
        },
        // 新增一条采购记录
        addPurchase: function (postdata) {
            return g.post_query(
                '/purchase/add',
                postdata
            )
        },
        // 采购单
        downloadPurchase: function (postdata) {
            g.downloads("/purchase/downloadPurchase","POST",JSON.stringify(postdata.purchase_ids))
        }
    }
});