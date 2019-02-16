define(['api/apiobj', 'config/global'], function (api, g) {
  api.teacher = {
    // 获取教师
    getTeacher: function (teacher_id) {
      return g.post_query('/teacher/getTeacher/' + teacher_id);
    },
    // 添加教师
    addTeacher: function (tid, tname, role, material_privilege, overtime_privilege) {
      return g.post_query('/teacher/addTeacher',
        {
          'tid': tid,
          'tname': tname,
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
    // 删除教师的教师组
    deleteTeacherGroup: function (tid, t_group_id) {
      return g.post_query(
        '/teacherGroup/deleteTeacherGroup/' + tid + '/' + t_group_id
      )
    },
    // 增加教师的教师组
    updateTeacherGroup: function (tid, t_group_id) {
      return g.post_query(
        '/teacherGroup/updateTeacherGroup',
        {
          'teacherGroupId.t_group_id': t_group_id,
          'teacherGroupId.tid': tid
        }
      );
    },
    // 修改教师
    updateTeacher: function (tid, tname, role, material_privilege, overtime_privilege) {
      return g.post_query(
        '/teacher/updateTeacher',
        {
          'tid': tid,
          'tname': tname,
          'role': role,
          'material_privilege': material_privilege,
          'overtime_privilege': overtime_privilege
        }
      )
    },
    // 直接获取全部老师
    getAllTeacher: function () {
      return g.post_query(
        '/teacher/getAllTeacher',
        {}
      )
    },
    // 获取物料权限
    getMaterialAuth: function () {
      return g.post_query('/teacher/getMaterialAuth')
    },
    getTGroup: function (tid) {
      return g.post_query(
        '/teacherGroup/getTGroup',
        { tid: tid }
      );
    }
  }
});