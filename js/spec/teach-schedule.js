require(['jquery', 'lodash', 'api/apiobj', 'config/global', 'config/config-course-schedule', 'util/date_format_transform', 'api/batch', 'api/student', 'api/experiment', 'api/proced'], function ($, _, api, g, ccs, dft) {

    $(function () {
        init_data();
    });

    function init_data() {
        fill_selectors();
    }

    var $templates = $('#templates')

    var schedule_batches = [];
    var div_batches = [];
    var proceds = [];
    var semesters = []

    var $semester_selector = $('#semester_selector');
    var $proced_selector = $('#proced_selector');
    var $week_selector = $('#week_selector');
    var $batch_selector = $('#batch_selector');

    var $class_table = $('#class_table');

    function fill_selectors() {

        // 填充学期selector
        $semester_selector.empty();
        api.batch.getAllSemesterName()
            .done(function (data) {
                if (data.status === 0) {
                    semesters = data.data;
                    _.each(semesters, function (semester, i) {
                        $('<option></option>').text(semester.semester_name).attr('data-semester-idx', i).appendTo($semester_selector);
                    });
                } else {
                    g.fetch_err(data)
                }
            })
            .fail(g.net_err)


        // 填充工种selector
        $proced_selector.empty();
        api.proced.getAllProced()
            .done(function (data) {
                if (data.status === 0) {
                    proceds = data.data;
                    _.each(proceds, function (pro_name) {
                        $('<option></option>').text(pro_name).appendTo($proced_selector);
                    });
                } else {
                    g.fetch_err(data);
                }
            })
            .fail(g.net_err);


        // 填充周selector
        $week_selector.empty();
        _.each(ccs.weekRange, function (val) {
            $('<option></option>').text('第' + val + '周').attr('data-week', val).appendTo($week_selector);
        });


        // 填充批次
        $batch_selector.empty();
        api.batch.getAllBatch()
            .done(function (data) {
                if (data.status === 0) {
                    div_batches = data.data;
                    _.each(div_batches, function (batch, i) {
                        $('<option></option>').text(batch.batch_name).attr('data-div_batches-idx', i).appendTo($batch_selector);
                    });
                    update_stud_group_selector();
                } else {
                    g.fetch_err(data)
                }
            })
            .fail(g.net_err)
    }


    // 查询课表功能
    // 1. 通过学期获取批次
    // 2. 通过批次和工种获取实习数据
    // 3. 将多次请求的实习数据合并成一个experiment_data数组
    var current_query_semester = null;
    $('#query_class_table').click(function () {
        var semester_idx = $semester_selector.find(':selected').attr('data-semester-idx');
        var semester = semesters[semester_idx];
        if (!semester) return;
        current_query_semester = semester;
        api.batch.getBatchBySemesterName(semester.semester_name)
            .done(function (data) {
                if (data.status === 0) {
                    schedule_batches = data.data;
                    console.log(schedule_batches)
                    get_data_from_batches_and_proced()
                } else {
                    g.fetch_err(data)
                }
            })
            .fail(g.net_err)
    });


    var experiment_data = [];
    function get_data_from_batches_and_proced() {
        var proced = $proced_selector.val();
        var all = schedule_batches.length;
        var cnt = 0;
        var done = false;
        var datas = [];
        _.each(schedule_batches, function (batch, i) {
            api.experiment.getExperimentByBatchAndProced(batch.batch_name, proced)
                .done(function (data) {
                    if (data.status === 0) {
                        cnt++;
                        datas.push(data.data);
                    } else {
                        cnt = all + 1;
                    }
                })
                .fail(function (data) {
                    cnt = all + 1;
                }).always(function () {
                    if (done) return;
                    if (cnt === all) {
                        done = true;
                        experiment_data = _.flatten(datas);
                        console.log(experiment_data)
                        fill_query_class_map();
                    }
                    if (cnt > all) {
                        done = true;
                        swal(
                            '提示',
                            '因网络或其他原因，获取数据出错',
                            'warning'
                        )
                    }
                });
        })
    }


    // 构建数据结构来快速检索
    // 采用多层对象映射的方式来做
    // week -> day -> time -> {batch_name:[experiment]}
    var class_map = {};
    var dateToWeekDayObj;
    function fill_query_class_map() {
        class_map = {}
        // console.log(current_query_semester);
        // 起始时间
        var beginDate = current_query_semester.date;
        // 获取 日期 到 周次的转换对象 
        dateToWeekDayObj = dft.dateToWeekDayObjFactory(beginDate);

        experiment_data = _.filter(experiment_data, 'time_quant')
        _.each(experiment_data, function (experiment, i) {
            var wdt = dateToWeekDayObj(experiment.time_quant.slice(0, -3));
            wdt.time = parseInt(experiment.time_quant.slice(-2))
            // console.log(wdt)
            var w = class_map[wdt.week] = class_map[wdt.week] || {}
            var d = w[wdt.day] = w[wdt.day] || {}
            var t = d[wdt.time] = d[wdt.time] || {}
            var exp_arr = t[experiment.batch_name] = t[experiment.batch_name] || []
            exp_arr.push(experiment)
        });
        console.log(class_map)
        redraw_class_table();
    }


    // 周选择器改变
    // 对应表格数据更新
    $week_selector.change(redraw_class_table);
    function redraw_class_table() {
        var weekDayToDateObj = dft.weekDayToDateObjFactory(current_query_semester.date);
        // 1. 获取周数
        var week = parseInt($week_selector.find(':selected').attr('data-week'));
        var $thead = $class_table.find('thead').empty();
        var $tbody = $class_table.find('tbody').empty();
        var $tr = $('<tr></tr>');
        _.each(ccs.dayRange, function (day, i) {
            if (i) {
                day = weekDayToDateObj({ week: week, day: i }) + '<br/>' + day;
            }
            $('<td></td>').html(day || '').appendTo($tr);
        });
        $tr.appendTo($thead);

        _.each(ccs.timeRange, function (time, i) {
            $tr = $('<tr></tr>');

            _.each(ccs.dayRange, function (day, j) {
                if (!j) {
                    $('<td></td>').text('' + _.range(time, time + ccs.timeRangeStep)).appendTo($tr)
                    day = weekDayToDateObj({ week: week, day: j }) + '<br/>' + day;
                }
                else {
                    var w = class_map[week] || {}
                    var d = w[j] || {}
                    var t = d[i] || {}
                    var out = batch_map_to_literal(t);
                    $('<td></td>').html(out).appendTo($tr);
                }
            });

            $tr.appendTo($tbody);
        });
    }


    function batch_map_to_literal(batch_map) {
        // console.log(batch_map)
        var list = []
        _.each(batch_map, function (experiments, batch_name) {
            // console.log('experiment',experiments)
            _.each(experiments, function (experiment) {
                list.push(batch_name + ':' + experiment.s_group_id);
            });
        });
        return list.join('<br/>')
    }





    function update_stud_group_selector() {
        var batch_idx = $('#batch_selector').find(':selected').attr('data-div_batches-idx');
        if (!batch_idx) return;

        var $stud_group_selector = $('#stud_group_selector').empty();
        api.batch.getAllSGroup(div_batches[batch_idx].batch_name)
            .done(function (data) {
                if (data.status === 0) {
                    var groups = _.sortBy(_.filter(data.data));
                    $('<option></option>').text('组名').appendTo($stud_group_selector);
                    _.each(groups, function (groupname) {
                        if (!groupname) return;
                        $('<option></option>').text(groupname).appendTo($stud_group_selector);
                    });
                } else {
                    g.fetch_err(data)
                }
            })
            .fail(g.net_err)
    }

    $('#query_student').click(function () {
        var batch_name = $('#batch_selector').val();
        if (!batch_name) return;
        var stud_group = $('#stud_group_selector').val();
        var promise = null;

        if (stud_group === '组名') {
            promise = api.student.getStudentByBatchName(batch_name)
        } else {
            promise = api.student.getStudentByBatchAndSGroup(batch_name, stud_group)
        }

        if (!promise) return;
        promise
            .done(function (data) {
                if (data.status === 0) {
                    // console.log(data.data)
                    fill_student_datas_table(data.data);
                } else {
                    g.fetch_err(data)
                }
            })
            .fail(g.net_err)
    });

    // 填充学生列表
    function fill_student_datas_table(data) {
        console.log(data)
        var $tbody = $('#student_datas_tbody').empty();
        var $temp = $templates.find('#student_data').children();

        _.each(data, function (student) {
            var $cloneTemp = $temp.clone();
            $cloneTemp.find('.sid').text(student.sid).end()
                .find('.sname').text(student.sname).end()
                .find('.clazz').text(student.clazz).end()
                .find('.batch_name').text(student.batch_name).end()
                .find('.s_group_id').text(student.s_group_id).end()
                .appendTo($tbody);
        });
    }

    // 导出表格
    $('#export_table').click(function () {
        var $table = $('#student_datas_table')
        var $th = $table.find('th');
        var row_size = $th.length;

        var th = []
        $th.each(function (i, dom) {
            th.push($(dom).text());
        });

        var tds = []
        $table.find('td').each(function (i, dom) {
            tds.push($(dom).text());
        });

        var matrix = _.chunk(tds, row_size);
        matrix.unshift(th);
        api.experiment.send_download_excel(matrix);
    });


});