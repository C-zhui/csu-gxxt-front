define(['api/apiobj', 'config/global'], function (api, g) {
    api.specialScore = {
        // 传sid查询特殊学生课表
        getClassBySid:function(sid){
            return g.post_query(
                '/specialScore/getClassBySid',
                {sid:sid}
            )
        },
        // 添加特殊学生的课时
        addClass:function(sid,proName,classTime,timeQuant){
            return g.post_query(
                '/specialScore/addClass',
                {
                    sid:sid,
                    proName:proName,
                    classTime:classTime,
                    timeQuant:timeQuant
                }
            )
        },
        // 删除课时 scoreIds
        deleteClass:function(scoreIds){
            return g.post_json(
                '/specialScore/deleteClass',
                scoreIds
            )
        }
    }
});