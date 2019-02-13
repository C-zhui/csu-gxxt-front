define(['api/apiobj', 'config/global'], function (api, g) {
    api.teacher = {
        // 获取教师
        getTeacher: function (teacher_id) {
            return g.post_query('/teacher/getTeacher/' + teacher_id);
        },
        // 添加教师
        addTeacher: function (tid, tname, t_group_id, role, material_privilege, overtime_privilege) {
            return g.post_query('/teacher/addTeacher',
                {
                    'tid': tid,
                    'tname': tname,
                    't_group_id': t_group_id,
                    'role': role,
                    'material_privilege': material_privilege,
                    'overtime_privilege': overtime_privilege
                });
        },
        //删除教师 传入数组
        deleteTeacher: function (teacher_ids) {
            return g.post_json(
                '/teacher/deleteTeacher',
                teacher_ids
            );
        },
        // 修改教师
        updateTeacher: function (tid, tname, t_group_id, role, material_privilege, overtime_privilege) {
            return g.post_query(
                '/teacher/updateTeacher',
                {
                    'tid': tid,
                    'tname': tname,
                    't_group_id': t_group_id,
                    'role': role,
                    'material_privilege': material_privilege,
                    'overtime_privilege': overtime_privilege
                }
            )
        }
    }
})