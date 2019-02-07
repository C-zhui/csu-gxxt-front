define(['api/apiobj','config/global'], function (api,g) {

    api.batch = {
        // 查询所有批次
        getAllBatch: function () {
            return g.post_query(
                '/batch/getAllBatch',
                {}
            )
        },
        getAllSGroup: function (batch_name) {
            return g.post_query(
            '/batch/getAllSGroup',
                { 'batch_name': batch_name }
            )
        }
    }

});