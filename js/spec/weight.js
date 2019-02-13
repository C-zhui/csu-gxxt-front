require(['jquery','swal', 'api/apiobj', 'config/global','api/batch','api/proced'],function ($,swal,api) {
    //总打分项的数量
    var proceCount=0;
    //添加打分项 弹出表格的 行列
    var tableRow=8;
    var tableColumn=1;

    $(document).ready(function () {
        init_data();
        console.log('init weight.js');
    });

    // 初始化数据
    function init_data() {
        //  初始化所有权重模版名
        findAllTemplate();
        //  获取所有批次
        getAllBatch();
    }


// 获取所有批次
    function getAllBatch() {
        api.batch.getAllBatch().done(function (data) {
            if (data.status === 0) {
                let data_arr = data.data;
                let batch1 = $('#weight_select_batch1').empty();
                let batch2 = $('#weight_select_batch2').empty();
                batch1.append('<option>批次选择</option>');
                batch2.append('<option>批次选择</option>');
                for (let i = 0; i < data_arr.length; i++) {
                    let option = $('<option></option>');
                    option.text(data_arr[i].batch_name);
                    batch1.append(option);
                    batch2.append(option.clone())
                }
            }
        });
    }

//  获取所有权重模版名
    function findAllTemplate() {
        api.proced.findAllTemplate().done(function (data) {
            if (data.status === 0) {
                let data_arr = data.data;
                let templates1 = $('#weight_select_templates1').empty();
                let templates2 = $('#weight_select_templates2').empty();
                templates1.append('<option>权重模版选择</option>');
                templates2.append('<option>权重模版选择</option>');
                for (let i = 0; i < data_arr.length; i++) {
                    let option = $('<option></option>');
                    option.text(data_arr[i]);
                    templates1.append(option);
                    templates2.append(option.clone());
                }
            }
        });
    }

// 权重模版选择内容变动时更新权重设置列表的内容
    $('#weight_select_templates1').change(function () {
        let new_template = $('#weight_select_templates1').val();

        if (new_template !== "权重模版选择") {
            api.proced.findTemplateItemByName(
                {
                    'name': new_template
                }
            ).done(function (data) {
                if (data.status === 0) {
                    let data_arr = data.data;
                    let weight_list = $('#weight_edit_list_adminTbody').empty();
                    for (let i = 0; i < data_arr.length; i++) {
                        let tr = $('<tr></tr>');
                        let td = $('<td class="edit_weight_list_name"></td>');
                        let td2 = $('<td></td>');
                        let input = $('<input type="text" disabled class="edit_weight_list form-control form-control-sm">');
                        td.text(data_arr[i].pro_name);
                        input.val(parseInt(100 * data_arr[i].weight));
                        td2.append(input);
                        tr.append(td);
                        tr.append(td2);
                        weight_list.append(tr);
                    }
                }
            });
        }
    });

// 点击编辑对权重设置表进行编辑
    $('#edit-weight-template').click(function () {
        $("#table-edit-status").css("display","block");
        $('input[class="edit_weight_list form-control form-control-sm"]').each(function () {
            this.removeAttribute("disabled");
        })
    });

// 点击保存提交修改后的权重，并禁止修改
    $('#save-weight-template').click(function () {
        let names = [];
        let weights = [];
        $("#table-edit-status").css("display","none");
        $('input[class="edit_weight_list form-control form-control-sm"]').each(function () {
            this.setAttribute("disabled", "disabled");
            weights.push(Number(this.value));
        });

        // 获取所有打分项
        let edit_weight_list_name = document.getElementsByClassName('edit_weight_list_name');
        for (let i = 0; i < edit_weight_list_name.length; i++) {
            names.push(edit_weight_list_name[i].getAttribute("value"));
        }
        let template_name = $('#weight_select_templates1').val(); // 排课模版名
        var form_arr = {};
        for (let i = 0; i < names.length; i++) {
            if (weights[i] < 0) {
                swal(
                    '权重设置有误',
                    '请勿设置权重为负数！',
                    'error'
                );
                return;
            }
            form_arr[names[i]] = weights[i] / 100;
        }

        return api.proced.addTemplate(template_name, form_arr).done(function (data) {
            if (data.status === 0) {
                swal(
                    '修改成功',
                    '修改排课模版权重成功',
                    'success'
                );
            } else {
                swal(
                    '修改失败',
                    '修改排课模版权重失败，请重试！',
                    'error'
                );
            }
        });
    });

    // 删除某一个权重方案
    $('#delete-weight-template').click(function () {
        let name = $('#weight_select_templates1').val(); // 排课模版名
        if (name === "权重模版选择") {
            swal(
                '选择方案',
                '请先选择权重方案',
                'warning'
            );
        } else {
            swal({
                title: '确定删除吗？',
                text: '确定删除吗？你将无法恢复它！',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: '确定删除！',
                cancelButtonText: '取消',
            }).then(result => {
                if (result.value) {
                    api.proced.deleteTemplate(
                        {
                            name: name
                        }
                    ).done(function (data) {
                            if (data.status === 0) {
                                console.log(data);
                                swal(
                                    '删除成功',
                                    '删除排课模版成功',
                                    'success'
                                );
                                //清空表格
                                $('#weight_edit_list_adminTbody').html('');
                                init_data();
                            } else {
                                swal(
                                    '删除失败',
                                    '删除排课模版失败，请重试！',
                                    'error'
                                );
                            }
                        }
                    )
                } else {
                    // handle dismiss, result.dismiss can be 'cancel', 'overlay', 'close', and 'timer'
                    console.log(result.dismiss)
                }
            })
        }
    })

// 绑定权重模版
    $('#band-weight-template').click(function () {
        let batch_name = $('#weight_select_batch1').val();
        let template_name = $('#weight_select_templates2').val();
        if (batch_name === "批次选择" || template_name === "权重模版选择") {
            swal(
                '请选择',
                '请选择批次和权重模版！',
                'warning'
            );
        } else {
            api.proced.band(
                {
                    batch_name: batch_name,
                    template_name: template_name
                }
            ).done(function (data) {
                    if (data.status === 0) {
                        swal(
                            '绑定成功',
                            '绑定批次与排课模版成功！',
                            'success'
                        );
                    } else {
                        console.log(data);
                        swal(
                            '绑定失败',
                            '绑定批次与排课模版失败！',
                            'error'
                        );
                    }
                }
            );
        }
    });

// 第二部分批次选择变动时更新权重展示列表的内容
    $('#weight_select_batch2').change(function () {
        let batch_name = $('#weight_select_batch2').val();
        // console.log(batch_name);
        if (batch_name !== "批次选择") {
            api.proced.getBatchProced(batch_name).done(function (data) {
                if (data.status === 0) {
                    let data_arr = data.data;
                    let weight_list = $('#show_weight_list_tbody').empty();
                    for (let i = 0; i < data_arr.length; i++) {
                        let tr = $('<tr></tr>');
                        let td = $('<td></td>');
                        let td2 = $('<td></td>');
                        td.text(data_arr[i].proid.pro_name);
                        td2.text(parseInt(100 * data_arr[i].weight) + '%');
                        tr.append(td);
                        tr.append(td2);
                        weight_list.append(tr);
                    }
                }
            });
        }
    });


// 添加新权重方法
    $('#add-new-plan').click(function () {
        //获取所有打分项,生成打分表格
        return api.proced.getAllProced().done(function (data) {
            if (data.status === 0) {
                let proces = data.data;
                proceCount = proces.length;
                tableColumn = Math.ceil(proces.length / tableRow);
                let lastColumRow = proces.length % tableRow;
                let talbeHeadTr = $('#new_weight_list_table thead tr').empty();
                for (let i = 0; i < tableColumn; i++) {
                    talbeHeadTr.append('<th>打分项</th><th>权重</th>');
                }

                let tableBody = $('#new_weight_list_table tbody').empty();
                let index = 0;
                for (let i = 0; i < lastColumRow; i++) {
                    $tr = $('<tr></tr>');
                    for (let j = 0; j < tableColumn; j++) {
                        $td = $('<td></td>');
                        if (proces[index] != null) {
                            $td.text(proces[index])
                        }
                        $td.appendTo($tr);
                        $tr.append('<td><input type="number" class="form-control form-control-sm"> %</td>');
                        ++index;
                    }
                    $tr.appendTo(tableBody)
                }
                for (let i = 0; i < tableRow - lastColumRow; i++) {
                    $tr = $('<tr></tr>');
                    for (let j = 0; j < tableColumn - 1; j++) {
                        $td = $('<td></td>');
                        if (proces[index] != null) {
                            $td.text(proces[index])
                        }
                        $td.appendTo($tr);
                        $tr.append('<td><input type="number" class="form-control form-control-sm"> %</td>');
                        ++index;
                    }
                    $tr.appendTo(tableBody)
                }

            } else {
                swal(
                    '获取打分项失败！',
                    '请重试',
                    'error'
                )
            }
        });
    });

//点击确认创建新的权重模板

    function createNewWeightTemp() {
        let name = $('#new_weight_temp_name').val();

        if (name === '') {
            swal('请设置模板名字');
            return;
        }

        let weights = [];
        let names = [];

        $tableBody = $('#new_weight_list_table tbody tr').each(function () {
            $(this).find('td:odd').each(function () {

                weights.push(Number($(this).find('input:first').val()));

            });
            $(this).find('td:even').each(function () {
                names.push($(this).text());
            })
        });

        let postData = {};

        for (let i = 0; i < names.length; i++) {
            if (weights[i] < 0) {
                swal(
                    '权重设置有误',
                    '请勿设置权重为负数！',
                    'error'
                );
                return;
            }
            if(weights[i]>0){
                postData[names[i]] = weights[i] / 100;
            }
        }
        api.proced.addTemplate(name, postData).done(function (data) {
            if (data.status === 0) {
                //重新初始化权重模板选择
                findAllTemplate();
                swal(
                    '创建成功',
                    '创建权重模板成功',
                    'success'
                )
            } else {
                swal(
                    '创建失败',
                    data.message,
                    'error'
                );
            }
        }).always(function () {
            $('#weight-plan-add').modal('hide');
        })
    }
});