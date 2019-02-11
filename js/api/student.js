define(['api/apiobj', 'config/global'], function (api, g) {
    api.student = {
        updateGroup: function (sid, s_group_id) {
            return g.post_query(
                '/student/updateSGroup',
                {
                    sid: sid,
                    s_group_id: s_group_id
                }
            )
        },
        getStudent: function (student_id) {
            return g.post_query('/student/getStudent/' + student_id, {});
        },
        getStudentByBatchName: function (batch_name) {
            return g.post_query('/student/getStudentByBatchName', {
                batchName: batch_name
            });
        },
        getStudentByBatchAndSGroup: function (batch_name, s_group_id) {
            return g.post_query('/student/getStudent',
                {
                    batch_name: batch_name,
                    s_group_id: s_group_id
                });
        },
        addSpStudent: function (student_id, template_name) {
            return g.post_query('/student/addSpStudent',
                {
                    sid: student_id,
                    template_name: template_name
                });
        },
        getAllSpStudent: function () {
            return g.post_query(
                '/student/getAllSpStudent',
                {}
            )
        },
        getSpStudentById: function (sp_sid) {
            return g.post_query(
                '/student/getSpStudentById',
                { id: sp_sid }
            )
        },
        getSpProName:function (sid) {
            let post_data={
                sid:sid
            };
            return g.post_json('/student/getSpProName',post_data);
        }
    }
})