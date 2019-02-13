
define(['api/apiobj', 'config/global'], function (api, g) {

    api.proced = {
        getAllProced: function () {
            return g.post_query(
                '/proced/getAllProced',
                {}
            )
        },
        // 添加新工序
        addProcedToGroup: function (groupName, proName) {
            return g.post_query(
                '/proced/addProcedToGroup',
                {
                    'groupName': groupName,
                    'proName': proName
                },
            )
        },
        // 更改工序名
        updateProcedFromGroup: function (t_group_id, old_pro_name, new_pro_name) {
            return g.post_query('/proced/updateProcedFromGroup',
                {
                    'groupName': t_group_id,
                    'newName': new_pro_name,
                    'old': old_pro_name
                });
        },
        // 删除工序
        deleteProcedFromGroup: function (t_group_id, pro_name) {
            return g.post_query(
                '/proced/deleteProcedFromGroup',
                {
                    'groupName': t_group_id,
                    'pro_name': pro_name
                }
            );
        },
        //获取所有权重模板名
        findAllTemplate: function () {
            return g.post_query('/proced/findAllTemplate');
        },
        //根据权重模板名获取内容
        findTemplateItemByName: function (post_data) {
            return g.post_query('/proced/findTemplateItemByName', post_data);
        },
        //添加或修改权重模板
        addTemplate: function (path, post_data) {
            return g.post_json('/proced/addTemplate?templateName=' + path, post_data);
        },
        //绑定权重模板与批次
        band: function (post_data) {
            return g.post_query('/proced/band', post_data);
        },
        //删除权重模板
        deleteTemplate: function (post_data) {
            return g.post_query('/proced/deleteTemplate', post_data);
        },
        //根据批次名获取工序信息
        getBatchProced: function (path) {
            return g.post_json('/proced/getBatchProced/' + path);
        },
    }
});