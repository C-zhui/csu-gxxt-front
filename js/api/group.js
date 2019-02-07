define(['api/apiobj', 'config/global'], function (api, g) {

    api.group = {
        getAllTeacherGroup: function () {
            return g.post_query(
                '/group/getAllGroup',
                {}
            )
        },

        getProcedByGroup: function (t_group_id) {
            return g.post_query(
                '/group/getProcedByGroup',
                { 'groupName': t_group_id }
            )
        }
    }

});