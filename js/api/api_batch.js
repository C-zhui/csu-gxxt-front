var api_batch = {
    // 查询所有批次
    getAllBatch: function () {
        return post_query(
            '/batch/getAllBatch',
            {}
        )
    },
    getAllSGroup: function (batch_name) {
        return post_query(
          '/batch/getAllSGroup',
            { 'batch_name': batch_name }
        )
    }
}