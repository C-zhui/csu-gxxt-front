require(['jquery', 'lodash', 'swal', 'api/apiobj', 'api/group', 'api/admin', 'api/overwork', 'flatpickr', 'util/cut_page3'], function ($, _, swal, api) {
    'use strict';

    $(function () {
        $(".mycalendar").flatpickr();
        init_data();


// 初始化数据
        function init_data() {
            // 获取所有教师组
            getAllGroup();
            console.log('init extra-work.js');
        }

        //根据id和option数组设置select
        function setSelect(id, options) {
            let select = $('#' + id).empty();
            _.forEach(options, function (value) {
                select.append($('<option></option>').text(value));
            });
        }


// 获取所有教师组
        function getAllGroup() {
            return api.group.getAllTeacherGroup().done(function (data) {
                if (data.status === 0) {
                    let data_arr = data.data;
                    let options = [
                        '选择教师组'
                    ];
                    _.forEach(data_arr, function (value) {
                        options.push(value.t_group_id);
                    });
                    setSelect('teacher_overwork_select_process', options);
                    setSelect('history_select_process', options);
                    setSelect('edit_history_select_process', options);
                    setSelect('stu_extra_select_process', options);
                    // 获取所有可以有加班管理权限的老师
                    findOverworkPrivilegeTeachers();
                    findOverworkPrivilegeTeachersEdit();
                    // 查询教师值班记录
                    getOverworkByTimeOrProName();
                    // 学生加班申请查询
                    getOverworkApplyByTime();
                }
            });
        }

// 根据教师组获取管理权限
        $('#teacher_overwork_select_process').change(function () {
            findOverworkPrivilegeTeachers();
        });
        $('#edit_history_select_process').change(function () {
            findOverworkPrivilegeTeachersEdit();
        });

// 根据教师组获取所有可以有加班管理权限的老师
        function findOverworkPrivilegeTeachers() {
            let teacherGroup = $('#teacher_overwork_select_process').val();
            if (teacherGroup === "选择教师组") {
                teacherGroup = "all";
            }

            return api.admin.findTeachers(teacherGroup, 'all', 'all', '加班管理').done(function (data) {
                if (data.status === 0) {
                    let data_arr = data.data;
                    let teacherOverwork = $('#teacher_overwork_select_teacher').empty().append('<option>选择教师</option>');
                    for (let i = 0; i < data_arr.length; i++) {
                        $('<option></option>').text(data_arr[i].tname).appendTo(teacherOverwork);
                    }
                }
            });
        }

// 根据教师组获取所有可以有加班管理权限的老师---编辑
        function findOverworkPrivilegeTeachersEdit() {
            let teacherGroup = $('#edit_history_select_process').val();
            if (teacherGroup === "选择教师组") {
                teacherGroup = "all";
            }
            return api.admin.findTeachers(teacherGroup, 'all', 'all', '加班管理').done(function (data) {
                if (data.status === 0) {
                    let data_arr = data.data;
                    let teacherOverwork = $('#edit_history_select_teacher').empty().append('<option>选择教师</option>');
                    for (let i = 0; i < data_arr.length; i++) {
                        $('<option></option>').text(data_arr[i].tname).appendTo(teacherOverwork);
                    }
                }
            });
        }

// 学生加班申请查询
        $('#get-over-work-by-time').click(function () {
            getOverworkApplyByTime();
        });

        function getOverworkApplyByTime() {
            let start_time = $('#stu_extra_work_start_time').val();
            let end_time = $('#stu_extra_work_end_time').val();
            let process = $('#stu_extra_select_process').val();
            if (start_time === "") {
                start_time = "1999";
            }
            if (end_time === "") {
                end_time = "2999";
            }
            if (process === "选择教师组") {
                process = "%";
            }
            return api.overwork.getOverworkApplyByTime(start_time, end_time, process).done(function (data) {
                if (data.status === 0) {
                    let data_arr = data.data;
                    let tableBody = $('#stu_extra_work_tbody').empty();
                    for (let i = 0; i < data_arr.length; i++) {
                        let tr = $('<tr></tr>');
                        $('<td></td>').text(chGMT(data_arr[i].apply_time)).appendTo(tr);
                        $('<td></td>').text(data_arr[i].sname).appendTo(tr);
                        $('<td></td>').text(data_arr[i].clazz).appendTo(tr);
                        $('<td></td>').text(data_arr[i].pro_name).appendTo(tr);
                        $('<td></td>').text(chGMT(data_arr[i].overwork_time)).appendTo(tr);
                        $('<td></td>').text((getGMThour(data_arr[i].overwork_time_end) - getGMThour(data_arr[i].overwork_time)) + 'h').appendTo(tr);
                        $('<td></td>').text(data_arr[i].reason).appendTo(tr);
                        tableBody.append(tr);
                    }
                }
                new CutPage('student-open-apply-table', 5);
            });
        }

// 新增教师值班
        $('#add-teacher-over-work').click(function () {
            let start_time = $('#teacher_overwork_start_time').val();
            let process = $('#teacher_overwork_select_process').val();
            let tname = $('#teacher_overwork_select_teacher').val();
            let last_time = $('#teacher_overwork_last_time').val();
            let reason = $('#extraWork-reason').val();

            api.overwork.addTeacherOverwork(start_time, last_time, process, tname, reason).done(function (data) {
                if (data.status === 0) {
                    swal(
                        '新增成功',
                        '新增教师加班成功',
                        'success'
                    );
                    // 刷新教师值班记录
                    getOverworkByTimeOrProName();
                    // 去除新增教师值班框中的内容
                    $('#teacher_overwork_start_time').val("");
                    $('#teacher_overwork_last_time').val("");
                    $('#extraWork-reason').val("");
                } else {
                    swal(
                        '新增失败',
                        String(data.message),
                        'error'
                    );
                }
            });
        });

// 查询教师值班记录
        $('#get-over-work-by-time-or-ProName').click(getOverworkByTimeOrProName);

        function getOverworkByTimeOrProName() {
            let start_time = $('#history_start_time').val();
            let end_time = $('#history_end_time').val();
            let process = $('#history_select_process').val();
            if (start_time === "") {
                start_time = "1999";
            }
            if (end_time === "") {
                end_time = "2999";
            }
            if (process === "选择教师组") {
                process = "%";
            }

            api.overwork.getOverworkByTimeOrProName(start_time, end_time, process).done(function (data) {
                if (data.status === 0) {
                    let data_arr = data.data;
                    let tableBody = $('#adminTbody').empty();
                    for (let i = 0; i < data_arr.length; i++) {
                        let last_time = getGMThour(data_arr[i].overwork_time_end) - getGMThour(data_arr[i].overwork_time);
                        let tr = $('<tr></tr>');
                        $('<td></td>').text(chGMT(data_arr[i].overwork_time)).appendTo(tr);
                        $('<td></td>').text(data_arr[i].tname).appendTo(tr);
                        $('<td></td>').text(data_arr[i].pro_name).appendTo(tr);
                        $('<td></td>').text(last_time).appendTo(tr);
                        $('<td></td>').text(data_arr[i].reason).appendTo(tr);
                        let td = $('<td></td>');
                        //编辑按钮
                        $('<img src="../../icon/edit.svg" class="row-image" data-toggle="modal" data-target="#editTeacherHistoryModal">').click(function () {
                            updateTeacherOverwork_init(this);
                        }).data({
                            id: data_arr[i].overwork_id,
                            tname: data_arr[i].tname,
                            reason: data_arr[i].reason,
                            begin: chGMT(data_arr[i].overwork_time),
                            pro_name: data_arr[i].pro_name,
                            last_time: last_time
                        }).text('编辑').appendTo(td);
                        td.append('&emsp;');
                        //删除按钮
                        $('<img src="../../icon/delete.svg" class="row-image">').click(function () {
                            deleteOverwork(this);
                        }).attr('id', data_arr[i].overwork_id).text('删除').appendTo(td);
                        tableBody.append(tr.append(td));
                    }

                    // 教师值班记录分页初始化
                    new CutPage('teacher-table', 5);
                }

            });
        }

// 修改教师值班记录初始化
        function updateTeacherOverwork_init(obj) {
            obj = $(obj);
            let overworkId = obj.data('id');
            let begin = obj.data('begin');
            let tname = obj.data('tname');
            let reason = obj.data('reason');
            let pro_name = obj.data('pro_name');
            let last_time = obj.data('last_time');

            $('#edit_history_overworkId').val(overworkId);
            $('#edit_history_start_time').val(begin);
            $('#edit_history_select_process').val(pro_name);
            $('#edit_history_select_teacher').val(tname);
            $('#edit_history_last_time').val(last_time);
            $('#edit_history_extraWork_reason').val(reason);
        }

// 修改教师值班记录
        $('#update-teacher-over-work').click(function () {
            let overworkId = $('#edit_history_overworkId').val();
            let begin = $('#edit_history_start_time').val();
            let pro_name = $('#edit_history_select_process').val();
            let tname = $('#edit_history_select_teacher').val();
            let duration = $('#edit_history_last_time').val();
            let reason = $('#edit_history_extraWork_reason').val();
            let end_time = chGMTAdd(begin, parseInt(duration));
            begin += ":00";
            return api.overwork.updateTeacherOverwork(tname, reason, begin, overworkId, end_time, pro_name).done(function (data) {
                if (data.status === 0) {
                    swal(
                        '修改成功',
                        '修改教师加班记录成功',
                        'success'
                    );
                    // 刷新教师值班记录
                    getOverworkByTimeOrProName();
                } else {
                    if (data.message === "Timestamp format must be yyyy-mm-dd hh:mm:ss[.fffffffff]") {
                        swal(
                            '修改失败',
                            '请选择开始时间！',
                            'info'
                        );
                    } else {
                        swal(
                            '修改失败',
                            '修改教师开放记录失败',
                            'error'
                        );
                    }
                }
            });
        });

// 删除教师值班记录
        function deleteOverwork(obj) {
            let id = $(obj).data('id');
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
                    api.overwork.deleteOverwork(id).done(function (data) {
                        if (data.status === 0) {
                            swal(
                                '删除成功',
                                '删除加班记录成功',
                                'success'
                            );
                            // 刷新教师值班记录
                            getOverworkByTimeOrProName();
                        } else {
                            swal(
                                '删除失败',
                                '删除加班记录失败',
                                'error'
                            );
                        }
                    });
                } else {
                    // handle dismiss, result.dismiss can be 'cancel', 'overlay', 'close', and 'timer'
                    console.log(result.dismiss)
                }
            })

        }

// 格林威治时间的转换
        Date.prototype.format = function (format) {
            var o = {
                "M+": this.getMonth() + 1, //month
                "d+": this.getDate(), //day
                "h+": this.getHours(), //hour
                "m+": this.getMinutes(), //minute
                "s+": this.getSeconds(), //second
                "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
                "S": this.getMilliseconds() //millisecond
            };
            if (/(y+)/.test(format))
                format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(format))
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            return format;
        };

// 获取标准时间格式
        function chGMT(gmtDate) {
            var mydate = new Date(gmtDate);
            return mydate.format("yyyy-MM-dd hh:mm");
        }

// 获取小时
        function getGMThour(gmtDate) {
            var mydate = new Date(gmtDate);
            return Number(mydate.format("hh"));
        }

// 加上一个数获得标准时间格式
        function chGMTAdd(gmtDate, k) {
            var mydate = new Date(gmtDate);
            mydate.setHours(mydate.getHours() + k);
            return mydate.format("yyyy-MM-dd hh:mm:ss");
        }
    });
});