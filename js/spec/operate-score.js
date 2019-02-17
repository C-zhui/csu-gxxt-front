require(['jquery', 'lodash', 'swal', 'api/apiobj', 'config/global', 'util/cut_page3', 'api/batch', 'api/proced', 'api/group', 'api/score', 'api/user', 'bootstrapTable'], function ($, _, swal, api, g, CutPage) {
    'use strict';

    let process = [];//该教师负责的所有工序
    let commonProcess = [];//教师和现在批次共同的工序

    const pageSize = 5;//分页每页行数

    let oldData = [];//原始成绩数据
    let student_list_table_config = {
        columns: [
            {
                checkbox: true
            },
            {
                field: 'sId',
                title: '学号'
            },
            {
                field: 'sName',
                title: '姓名'
            },
            {
                field: 'clazz',
                title: '班级'
            },
            {
                field: 'batch',
                title: '实习批次'
            },
            {
                field: 'proced',
                title: '工种'
            },
            {
                field: 'group',
                title: '组号'
            },
            {
                field: 'score',
                title: '分数',
                formatter: function (value, row, index) {
                    return [
                        '<input type="text" value="' + value + '" size="8px;" style="text-align: center;"> '
                    ]
                }
            }
        ],
        data: []
    };

    $(function () {
        Init();

        function Init() {
            getAllBatch();
            getProcess();
            console.log('init operate-score.js');
        }

        function getProcess() {
            let teacherGroup = JSON.parse(localStorage.user)['教师组'].split(',');
            process = [];
            for (let i = 0; i < teacherGroup.length; i++) {
                api.group.getProcedByGroup(teacherGroup[i])
                    .done(function (data) {
                        if (data.status === 0) {
                            process = _.concat(process, data.data);
                        } else {
                            console.log(data.message);
                        }
                    })
            }
        }

        //获取并设置所有批次
        function getAllBatch() {
            api.batch.getAllBatch().done(function (data) {
                if (data.status === 0) {
                    let studentListSelect = $('#student-list-batch').empty().append('<option>选择批次</option>');
                    let scoreImportSelect = $('#score-import-batch').empty().append('<option>选择批次</option>');
                    _.forEach(data.data, function (value) {
                        let option = $('<option></option>').text(value.batch_name);
                        studentListSelect.append(option);
                        scoreImportSelect.append(option.clone());
                    })
                }
            })
        }


        //根据批次变化获取成绩列表并获取设置组号
        $('#student-list-batch').change(function () {
            let batchName = $(this).val();

            if (batchName === '选择批次') {
                $('#student-list-group').empty().append('<option>选择组号</option>');
                $('#student-list-proced').empty().append('<option>选择工种</option>');
                return;
            }

            api.batch.getAllSGroup(batchName).done(function (data) {
                if (data.status === 0) {
                    let groupSelect = $('#student-list-group').empty().append('<option>选择组号</option>');
                    _.forEach(data.data, function (value) {
                        groupSelect.append($('<option></option>').text(value));
                    });
                    api.proced.getBatchProced(batchName).done(function (data) {
                        if (data.status === 0) {
                            let batchProcess = [];
                            _.forEach(data.data, function (value) {
                                batchProcess.push(value.proid.pro_name);
                            });
                            commonProcess = _.intersection(process, batchProcess);
                            //设置工种select
                            let procedSelect = $('#student-list-proced').empty().append('<option>选择工种</option>');
                            for (let i = 0; i < commonProcess.length; i++) {
                                procedSelect.append($('<option></option>').text(commonProcess[i]));
                            }
                            let postData = {
                                batch_name: batchName,
                                s_group_id: 'all',
                                pro_name: 'all',
                                sId: 'all',
                                sName: 'all'
                            };
                            api.score.getScore(postData).done(getScoreSuccess);
                        }
                    })

                } else {
                    console.log(data.message);
                }
            })
        });

        //根据分组变化进行筛选
        $('#student-list-group').change(scoreFilter);
        //根据工种变化进行筛选
        $('#student-list-proced').change(scoreFilter);

        //成绩筛选函数
        function scoreFilter() {
            let proced = $('#student-list-proced').val();
            let group = $('#student-list-group').val();
            let batchName = $('#student-list-batch').val();
            if (gropu === '选择组号') {
                group = 'all';
            }
            if (proced === '选择工种') {
                proced = 'all';
            }
            let postData = {
                batch_name: batchName,
                s_group_id: group,
                pro_name: proced,
                sId: 'all',
                sName: 'all'
            };
            api.score.getScore(postData).done(getScoreSuccess);
        }

        //获取学生成绩列表
        $('#get-score').click(function () {
            let batchName = $('#student-list-batch').val();
            if (batchName === '选择批次') {
                swal(
                    '错误',
                    '请选择批次',
                    'error'
                );
                return;
            }
            let postData = {
                batch_name: batchName,
                s_group_id: gropu,
                pro_name: 'all',
                sId: $('#sid').val(),
                sName: $('#sname').val()
            };
            api.score.getScore(postData).done(getScoreSuccess);
        });

        function getScoreSuccess(data) {
            if (data.status === 0) {
                let tableData = [];
                let batchName = $('#student-list-batch').val();
                let index = 1;
                _.forEach(data.data, function (value) {
                    _.forEach(commonProcess, function (proced) {
                        let row = {
                            sId: value.sid,
                            sName: value.sname,
                            clazz: value.clazz,
                            batch: batchName,
                            proced: proced,
                            group: value.s_group_id,
                            index: index
                        };
                        if (!_.isNil(value[proced] && !isNaN(Number(value[proced])))) {
                            row.score = value[proced];
                        } else {
                            row.score = '无';
                        }
                        tableData.push(row);
                        ++index;
                    })
                });
                student_list_table_config.data = tableData;
                oldData = _.cloneDeep(tableData);
                $('#student-list-table').bootstrapTable('destroy').bootstrapTable(student_list_table_config);
                CutPage.cutPage('student-list-table', pageSize);
            } else {
                console.log(data.message);
            }
        }

        //批量设置表格中的学生成绩
        $('#set-score').click(function () {
            let score = $('#score').val();
            let table = $('#student-list-table');
            let selectRows = table.bootstrapTable('getSelections');
            let inputs = $('#student-list-table tbody input:odd');
            _.forEach(selectRows, function (value) {
                $(inputs[value.index - 1]).val(score);
                student_list_table_config.data[value.index - 1].score = score;
            });
        });

        //提交修改成绩
        $('#submit-score').click(function () {
            let newData = student_list_table_config.data;
            let ajaxArray = [];
            let inputs = $('#student-list-table tbody input:odd');
            for (let i = 0; i < inputs.length; i++) {
                let val = $(inputs[i]).val();
                if (val !== oldData[i].score) {
                    console.log($(inputs[i]).val(), oldData[i].score);
                    let scoreMap = {};
                    scoreMap[newData[i].proced] = val;
                    ajaxArray.push(api.score.updateSpScore(newData[i].sId, scoreMap));
                }
            }
            $.when.apply(ajaxArray).done(function () {
                let flag = true;
                for (let i = 0; i < arguments.length; i++) {
                    let data = arguments[i][0];
                    try {
                        if (data.status === 0) {
                            flag = false;
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
                if (flag) {
                    swal(
                        '成功',
                        '成绩提交成功',
                        'success'
                    )
                } else {
                    swal(
                        '失败',
                        '部分成绩提交失败',
                        'error'
                    )
                }
            });
        });
        //下载标准模板
        $('#download-file').click(function () {
            // 创建a标签，设置属性，并触发点击下载
            let a = $("<a>");
            a.attr("href", g.base_url + '/admin/downloadScore');
            $("body").append(a);
            a[0].click();
            a.remove();
        });

        //根据导入批次变化获取打分项
        $('#score-import-batch').change(function () {
            let batchName = $(this).val();
            api.proced.getBatchProced(batchName).done(function (data) {
                if (data.status === 0) {
                    let porcedSelect = $('#score-import-proced').empty().append('<option>选择打分项</option>');
                    _.forEach(data.data, function (value) {
                        porcedSelect.append($('<option></option>').text(value.proid.pro_name));
                    })
                }
            })
        });

        //批量导入成绩
        $('#import-score').click(function () {
            let form = new FormData();
            let batchName = $('#score-import-batch').val();
            let scoreitem = $('#score-import-proced').val();
            form.append("batch_name", batchName);
            form.append("pro_name", scoreitem);
            form.append('file', $('#file')[0].files[0]);
            api.score.importScore(form).done(function (data) {
                console.log('success');
                if (data.status === 0) {
                    swal(
                        '成功',
                        '批量导入成绩成功',
                        'success'
                    );
                    $('#tf').empty();
                } else {
                    swal(
                        '失败',
                        '批量导入成绩失败',
                        'error'
                    )
                }
            });
        })
    })
});