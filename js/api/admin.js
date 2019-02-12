define(['api/apiobj','config/global'],function (api, g) {
    api.admin={
        findTeachers:function (tClass, role, material_privilege, overwork_privilege) {
            let postData={
                tClass:tClass,
                role:role,
                material_privilege:material_privilege,
                overwork_privilege:overwork_privilege
            };
            return g.post_query('/admin/findTeachers',postData);
        }
    }
})