define(['api/apiobj', 'config/global'], function (api, g) {
    api.student = {
        // 切换学生分组
        updateGroup: function (sid, s_group_id) {
            return g.post_query(
                '/student/updateSGroup',
                {
                    sid: sid,
                    s_group_id: s_group_id
                }
            )
        },
        // 获取学生信息
        getStudent: function (student_id) {
            return g.post_query('/student/getStudent/' + student_id, {});
        },
        //添加学生
        addStudent: function (sid, sname, clazz, batch_name) {
            return g.post_query('/student/addStudent',
                {
                    'sid': sid,
                    'sname': sname,
                    'clazz': clazz,
                    'batch_name': batch_name
                });
        },
        // 删除学生
        deleteStudent: function (sid_arr) {
            return g.post_json('/student/deleteStudent',
                sid_arr
            )
        },
        // 修改学生
        updateStudent: function (sid, sname, clazz, batch_name) {
            return g.post_json('/student/updateStudent',
                {
                    'sid': sid,
                    'sname': sname,
                    'clazz': clazz,
                    'batch_name': batch_name
                });
        },
        // 获取批次里的学生
        getStudentByBatchName: function (batch_name) {
            return g.post_query('/student/getStudentByBatchName', {
                batchName: batch_name
            });
        },
        // 根据批次、分组获取学生
        getStudentByBatchAndSGroup: function (batch_name, s_group_id) {
            return g.post_query('/student/getStudent',
                {
                    batch_name: batch_name,
                    s_group_id: s_group_id
                });
        },
        // 添加特殊学生
        addSpStudent: function (student_id, template_name) {
            return g.post_query('/student/addSpStudent',
                {
                    sid: student_id,
                    template_name: template_name
                });
        },
        // 获取所有特殊学生
        getAllSpStudent: function () {
            return g.post_query(
                '/student/getAllSpStudent',
                {}
            )
        },
        // 根据特殊学生id获取
        getSpStudentById: function (sp_sid) {
            return g.post_query(
                '/student/getSpStudentById',
                { id: sp_sid }
            )
        },
        getSpProName: function (sid) {
            let post_data = {
                sid: sid
            };
            return g.post_json('/student/getSpProName', post_data);
        },
        // 传入特殊学生数组删除特殊学生
        deleteSpStudentById: function (sids) {
            return g.post_json(
                '/student/deleteSpStudentById',
                sids
            )
        }
    }
})