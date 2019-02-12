define(['api/apiobj', 'config/global'],function (api, g) {
    api.overwork={
        getOverworkApplyByTime:function (begin, end, pro_name) {
            let post_data={
                begin:begin,
                end:end,
                pro_name:pro_name
            };
            return g.post_query('/overwork/getOverworkApplyByTime',post_data);
        },
        addTeacherOverwork:function (begin, duration, pro_name, t_name, reason) {
            let post_data={
                begin:begin,
                duration:duration,
                pro_name:pro_name,
                t_name:t_name,
                reason:reason
            };
            return g.post_query('/overwork/addTeacherOverwork',post_data);
        },
        getOverworkByTimeOrProName:function (begin, end, pro_name) {
            let post_data={
                begin:begin,
                end:end,
                pro_name:pro_name
            };
            return g.post_query('/overwork/getOverworkByTimeOrProName',post_data);
        },
        updateTeacherOverwork:function (tname, reason, begin, overworkId, end, pro_name) {
            let post_data={
                tname:tname,
                reason:reason,
                begin:begin,
                overworkId:overworkId,
                end:end,
                pro_name:pro_name
            };
            return g.post_query('/overwork/updateTeacherOverwork',post_data);
        },
        deleteOverwork:function (id) {
            return g.post_query('/overwork/deleteOverwork',{
                id:id
            });
        }
    }
})