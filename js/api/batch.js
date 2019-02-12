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
        // 添加学期
        // addSemester: function (semester_name, beginDate) {
        //     return g.post_query(
        //         '/batch/addBatch',
        //         {
        //             'semester_name': semester_name,
        //             'credit':1,
        //             'beginDate': beginDate
        //         }
        //     );
        // },
        // 获取学期信息
        getBatchBySemesterName: function (semester_name) {
            return g.post_query('/batch/getBatchBySemesterName',
                {
                    semester_name: semester_name
                });
        },
        deleteSemester: function (semesterName) {
            return g.post_query('/batch/deleteSemester',
                {
                    semesterName: semesterName
                });
        },
        // 添加批次或学期，如果批次名为空，则为学期
        addBatch: function (semester_name, batch_name, credit, beginDate) {
            return g.post_query(
                '/batch/addBatch',
                {
                    'batch_name': batch_name,
                    'credit': credit,
                    'semester_name': semester_name,
                    'beginDate': beginDate
                }
            );
        },
        // 更新 批次信息
        updateBatch: function (semester_name, batch_name, credit, beginDate, bat_describe) {
            return g.post_query(
                '/batch/updateBatch',
                {
                    'semester_name': semester_name,
                    'batch_name': batch_name,
                    'credit': credit,
                    'beginDate': beginDate,
                    'bat_describe': bat_describe
                });
        },
        // deleteBatch
        deleteBatch: function (batch_name) {
            return g.post_query(
                '/batch/deleteBatch/' + batch_name,
                {}
            )
        }
    }
});