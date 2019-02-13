define(['api/apiobj', 'config/global'], function (api, g) {

    api.group = {
        //获取所有教师组
        getAllTeacherGroup: function () {
            return g.post_query(
                '/group/getAllGroup',
                {}
            )
        },
        // 获取分组名
        getProcedByGroup: function (t_group_id) {
            return g.post_query(
                '/group/getProcedByGroup',
                { 'groupName': t_group_id }
            )
        },
        // 添加教师组
        addGroup: function (t_group_id) {
            return g.post_json(
                '/group/addGroup',
                {
                    t_group_id: t_group_id
                }
            );
        },
        // 更新教师组名
        updateGroup: function (old_t_group_id, new_t_group_id) {
            return g.post_query(
                '/group/updateGroup',
                {
                    'old': old_t_group_id,
                    'newName': new_t_group_id
                }
            )
        },
        // 删除教师组
        delete:function(t_group_id){
            return g.post_query(
                '/group/delete',
                {groupName:t_group_id}
            )
        }
    }
});