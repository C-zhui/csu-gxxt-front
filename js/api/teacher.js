define(['api/apiobj','config/global'],function (api,g) {
    api.teacher={
        getTeacher:function (teacher_id) {
            return g.post_query('/teacher/getTeacher/'+teacher_id);
        }
    }
})