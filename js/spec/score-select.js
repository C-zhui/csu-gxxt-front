require(['jquery', 'swal', 'config/global', 'api/apiobj', 'util/cut_page3', 'api/score', 'api/proced', 'api/student'], function ($, swal, g, api, CutPage) {
    let process = [];//学生的所有工序
    let user = JSON.parse(localStorage.user);
    const pageSize = 5;//分页每页行数
    $(function () {
        Init();

        function Init() {
            getScore();
            console.log('init score-select.js');
        }

        //获取并设置学生成绩
        function getScore() {
            //通过是否有批次判断是否是特殊学生
            if (user['批次'] !== undefined && user['批次'] !== null) {
                let batchName = user['批次'];
                $('#batch').text(batchName);
                api.proced.getBatchProced(batchName)
                    .done(function (data) {
                        if (data.status === 0) {
                            process = [];
                            for (let i = 0; i < data.data.length; i++) {
                                process.push(data.data[i].proid.pro_name);
                            }
                            getScoreDetail();
                        }
                    }).fail(g.net_err);
            } else {
                $('#batch').text('特殊学生');
                api.student.getSpProName(user.id).done(function (data) {
                    if (data.status === 0) {
                        process = data.data;
                        getScoreDetail();
                    }
                })
            }

        }

        //获取学生成绩详情
        function getScoreDetail() {
            return api.score.getMyScore(user.id)
                .done(function (data) {
                    if (data.status === 0) {
                        let scoreData = data.data[0];
                        if (scoreData.release === undefined || scoreData.release === '未发布') {
                            $('#total-score').text('暂未发布');
                        } else {
                            $('#total-score').text(scoreData.degree);
                        }
                        let tableBody = $('#score-table tbody');
                        for (let i = 0; i < process.length; i++) {
                            let tr = $('<tr></tr>');
                            $('<td></td>').text(process[i]).appendTo(tr);
                            let score = Number(scoreData[process[i]]);
                            if (scoreData[process[i]] !== null && scoreData[process[i]] !== undefined && !isNaN(score)) {
                                $('<td></td>').text(score).appendTo(tr);
                            } else {
                                $('<td></td>').text('无').appendTo(tr);
                            }
                            tableBody.append(tr);
                        }
                        CutPage.cutPage('score-table', pageSize);
                    } else {
                        g.fetch_err(data);
                    }
                }).fail(g.net_err);
        }
    })
});