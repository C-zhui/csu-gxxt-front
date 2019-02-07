var api_group = {
    getAllTeacherGroup: function () {
        return post_query(
            '/group/getAllGroup',
            {}
        )
    },

    getProcedByGroup: function (t_group_id) {
        return post_query(
            '/group/getProcedByGroup',
            { 'groupName': t_group_id }
        )
    }
}