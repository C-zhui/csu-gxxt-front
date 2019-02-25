define(['api/apiobj', 'config/global'], function (api, g) {

    api.score = {
        // 根据条件查询成绩
        getScore: function (post_data) {
            return g.post_query('/score/getScore', post_data);
        },
        //核算某个批次的总成绩
        executeScore: function (post_data) {
            return g.post_query('/score/executeScore', post_data);
        },
        //为某个批次设定等级评定规则
        setDegree: function (path, post_data) {
            return g.post_json('/score/setDegree?way=' + path, post_data);
        },
        //发布某个批次的总成绩
        release: function (post_data) {
            return g.post_query('/score/release', post_data);
        },
        //更新成绩接口
        updateScore: function (post_data) {
            return g.post_json('/score/updateScore', post_data);
        },
        //批量导入学生成绩
        importScore: function (post_data) {
            return g.post_file('/score/importScore', post_data);
        },
        //查询提交记录
        getScoreRecord: function (post_data) {
            let query = $.param(post_data);
            return g.post_query('/score/getScoreRecord?' + query, {});
        },
        //查询成绩修改记录
        getScoreUpdate: function (post_data) {
            let query = $.param(post_data);
            return g.post_query('/score/getScoreUpdate?' + query, {});
        },
        //查询成绩录入记录
        getInputInfo:function (batchName='all',proName='all',sgroup='all',sid='all',sname='all') {
            let post_data={
                batchName:batchName,
                proName:proName,
                sgroup:sgroup,
                sid:sid,
                sname:sname
            };
            return g.post_json('/score/getInputInfo',post_data);
        },
        //查询特殊学生成绩
        getSpScore: function (templateName = '', sid = '', sname = '') {
            if (templateName !== '') {
                return g.post_query('/score/getSpScore?templateName=' + templateName);
            }
            let post_data={
                sid:sid,
                sname:sname,
            };
            return g.post_query('/score/getSpScore',post_data);
        },
        //更新特殊学生成绩
        updateSpScore:function (sid, new_score_map) {
            return g.post_json('/score/updateSpScore?sid='+sid,new_score_map);
        },
        //发布特殊学生成绩
        releaseSpScore:function (sids) {
            return g.post_json('/score/releaseSpScore',{
                sid:sids
            });
        },
        //根据学号查询学生成绩
        getMyScore: function (sid) {
            return g.post_query('/score/getMyScore', {
                sid: sid
            });
        },
        //教师端修改学生成绩
        updateScore2: function (postData) {
            return g.post_json('/score/updateScore2', postData);
        },
        //核算特殊学生总成绩
        executeSpScore: function (templateName) {
            return g.post_query('/score/executeSpScore', {
                templateName: templateName
            });
        }
    };
});