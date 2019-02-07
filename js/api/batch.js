define(['api/apiobj', 'config/global'], function (api, g) {

    api.batch = {
        // 查询所有批次
        getAllBatch: function () {
            return g.post_query(
                '/batch/getAllBatch',
                {}
            )
        },
        //根据批次名查询学生组
        getAllSGroup: function (batch_name) {
            return g.post_query(
                '/batch/getAllSGroup',
                { 'batch_name': batch_name }
            )
        },
        // 获取所有学期名
        getAllSemesterName: function () {
            return g.post_query(
                '/batch/getAllSemesterName',
                {});
        },
        // 获取学期信息
        getBatchBySemesterName:function(semester_name){
            return g.post_query('/batch/getBatchBySemesterName',
            {
                semester_name:semester_name
            });
        },
        // 添加批次或学期，如果批次名为空，则为学期
        addBatch:function(batch_name,credit,semester_name){
            return g.post_query(
                '/batch/addBatch',
                {
                    'batch_name': batch_name,
                    'credit': credit,
                    'semester_name': semester_name
                }
            );
        }

    }
});