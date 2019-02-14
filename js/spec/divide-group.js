require(['jquery', 'lodash', 'swal', 'api/apiobj', 'config/global', 'util/cut_page3', 'util/date_format_transform', 'config/config-course-schedule', 'api/experiment', 'api/batch', 'api/proced', 'api/studentGroup', 'api/student', 'api/specialScore'], function ($, _, swal, api, g, CutPage, dft, ccs) {

  const pageSize = 5;//设置分页页数
  $(document).ready(function () {
    init_data()
    console.log('init divide-group.js')
  })

  function init_data() {
    fillWeekSelectorOptions();
    // drawDistributionTable()();
    // 获取所有模版
    fillTemplateSelectorOptions($('.template-selector'));
    // 查询所有批次
    fillBatchSelectorOptions($('.batch-selector'));
    // 获取所有工种
    fillProcedOptions();
    fillScoreTemplateOptions();
  }


  // 填充模板选项
  function fillTemplateSelectorOptions($templateSelector) {
    api.experiment.getAllTemplates()
      .done(function (data) {
        if (data.status === 0) {
          var data_arr = data.data;
          // var $templateSelector = $('#course_divide1_select_temp')
          $('<option>').text('排课模版选择').appendTo($templateSelector)
          _.each(data_arr, function (d) {
            $('<option>').text(d).appendTo($templateSelector)
          })
        } else {
          g.fetch_err(data)
        }
      }).fail(g.net_err);
  }

  // 填充批次
  var batches = []
  function fillBatchSelectorOptions($batch_selector) {
    api.batch.getAllBatch()
      .done(function (data) {
        if (data.status === 0) {
          batches = data.data;
          // console.log('批次')
          // console.log(batches)
          var temp = $('<span><option>实习批次选择</option></span>')
          _.each(batches, function (batch, index) {
            $('<option></option>').text(batch.batch_name).attr('batch-index', index).appendTo(temp)
          })
          $batch_selector.html(temp.html())
        } else {
          g.fetch_err(data)
        }
      }).fail(g.net_err);
  }

  // 绑定模板(或者再次绑定)
  $('#bundle-btn').click(bundleTemplate);

  function bundleTemplate() {
    var template_id = $('#course_divide1_select_temp').val();
    var batch_name = $('#course_divide1_select_batch').val();
    // console.log(template_id);
    if (template_id === "排课模版选择" || batch_name === "实习批次选择") {
      // console.log(template_id);
      swal(
        '请先选择批次和模版',
        '请选择批次和模版后再进行绑定操作！',
        'warning'
      );
    }
    else {
      api.experiment.bundleTemplateRequest(batch_name, template_id)
        .done(function success(data) {
          if (data.status === 0) {
            swal(
              '绑定成功',
              String(data.message),
              'success'
            );
          } else {
            g.fetch_err(data)
          }
        }).fail(g.net_err);
    }
  }

  function fillWeekSelectorOptions() {
    var $weekselect = $('#course_divide1_select_week');
    _.each(ccs.weekRange, function (val, i) {
      $('<option>').text('第' + val + '周').attr('week', val).appendTo($weekselect);
    })
  }

  var dateToWeek = null;
  var weekDaytoDate = null;
  var $course_divide1_select_batch2 = $('#course_divide1_select_batch2')
  $course_divide1_select_batch2.change(function () {
    $("#class-time-table-box").css("display", "block");
    var batch_index = $course_divide1_select_batch2.find('option:selected').attr('batch-index');
    var batch_name = batches[batch_index].batch_name;
    dateToWeek = dft.dateToWeekDayObjFactory(batches[batch_index].beginDate);
    weekDaytoDate = dft.weekDayToDateObjFactory(batches[batch_index].beginDate);
    if (batch_name && batch_name !== '实习批次选择') {
      api.experiment.getExperimentByBatch(batch_name)
        .done(function success(data) {
          if (data.status === 0) {
            ProcessNewDistributionData(data.data)
            initDistributionTable()
          } else {
            g.fetch_err(data)
          }
        }).fail(g.net_err);
    }
  });



  // time_quant 格式 'YYYYmmddtt' 
  var data_group_by_ctime = {}; // 分配数据 
  function ProcessNewDistributionData(data) {
    data_group_by_ctime = _.groupBy(data, 'class_time')
    _.each(data_group_by_ctime, function (group, k, data_group_by_ctime) {
      var date_time = group[0].time_quant //最后两个作为第几节课的索引
      var allNotNull = _.every(group, function (v, j) {
        return date_time && date_time == v.time_quant;
      });

      if (allNotNull) {
        data_group_by_ctime[k].distributed = true;
        // console.log(date_time.slice(0, -3))
        var wdt = dateToWeek(date_time.slice(0, -3));
        wdt.time = parseInt(date_time.slice(-2));
        data_group_by_ctime[k].wdt = wdt;
      }
      else {
        data_group_by_ctime[k].distributed = false;
        data_group_by_ctime[k].wdt = null;
      }
    });
    // console.log(data_group_by_ctime)
  }

  function initDistributionTable() {
    drawClassTimeContainer()
    drawDistributionTable()
  }

  function drawClassTimeContainer() {
    var $class_time_container = $('#class-time-container').empty()
    var $tr = $('<tr>');
    var cnt = 0;
    _.each(data_group_by_ctime, function (group, class_time) {
      if (!$tr) $tr = $('<tr>')
      var $td = $('<td>').text(class_time).attr('class_time', class_time)
      if (group.wdt)
        $td.addClass('distributed')
      $td.appendTo($tr);
      cnt++;
      if (cnt % ccs.class_time_container_line_size == 0) {
        $tr.appendTo($class_time_container);
        $tr = null;
      }
    });
    if ($tr)
      $tr.appendTo($class_time_container);
  }

  function getGroupInWeek(week) {
    var res = {}
    _.each(data_group_by_ctime, function (group, ctime) {
      if (group.wdt && group.wdt.week == week) {
        var day = group.wdt.day
        var time = group.wdt.time
        if (!res[day])
          res[day] = {}
        res[day][time] = ctime;
      }
    })
    return res
  }

  function drawDistributionTable() { // 画出指定周的课表
    var week = $('#course_divide1_select_week option:selected').attr('week');
    week = parseInt(week)
    // console.log('drawDistributionTable week' + week)
    var classInWeek = getGroupInWeek(week)
    // console.log(classInWeek)
    var $distribution_table_head = $('#distribution-table-head').empty()
    var $tr = $('<tr>');
    _.each(ccs.dayRange, function (val, i) {
      val = val || ''
      if (i)
        val = val + '<br/>' + weekDaytoDate({ week: week, day: i })
      $('<th>').attr('day', i).html(val).appendTo($tr);
    });
    $tr.appendTo($distribution_table_head)

    var $distribution_table_body = $('#distribution-table-body').empty()
    _.each(ccs.timeRange, function (tval, ti) {
      var $tr = $('<tr>');
      $('<th>').attr('time', ti).text('' + _.range(tval, tval + ccs.timeRangeStep)).appendTo($tr)
      _.each(ccs.dayRange, function (dval, di) {
        if (dval) {
          var $td = $('<td>').attr('day', di).attr('time', ti)
          if (classInWeek[di] && classInWeek[di][ti]) {
            $td.text(classInWeek[di][ti]);
            data_group_by_ctime[classInWeek[di][ti]].dom = $td;
            $td.attr('conquer', 1);
          }
          $td.appendTo($tr);
        }
      });
      $tr.appendTo($distribution_table_body)
    })
  }

  // 编辑排课表
  var distributeEditMode = false;
  var $edit_distribution = $('#edit-distribution').click(function () {
    // console.log("$('#edit-template-name').click")
    if (distributeEditMode) {
      $class_time_container.hide();
      distributeEditMode = false;
      $('#table-edit-status').css('display', 'none')
    } else {
      $("#class-time-table-box").css("display", "block")
      $class_time_container.show();
      distributeEditMode = true;
      $('#table-edit-status').css('display', 'block')

    }
  });

  var $class_time_container = $('#class-time-container').hide();
  var $class_time_selected = null;
  var clicktime = new Date();
  var t;
  $class_time_container.on('click', 'td', function () {
    // console.log("$class_time_container.on('click', 'td')")
    var newClicktime = new Date();
    var elapse = newClicktime - clicktime;
    // console.log('elapse', elapse)
    var $this = $(this)
    $class_time_selected = null;
    $('.selected', $class_time_container).removeClass('selected');
    if ($this.hasClass('distributed')) { // 
      if (elapse < 200) { // 双击取消分配
        if (t) {
          // console.log(t)
          clearTimeout(t);
          t = null;
        }
        $this.removeClass('distributed')
        var class_time = parseInt($this.attr('class_time'))
        if (!class_time) return;
        var ct_group = data_group_by_ctime[class_time]
        if (ct_group.dom) {
          ct_group.dom.text('');
          ct_group.dom.attr('conquer', '')
          ct_group.dom = null;
          ct_group.wdt = null;
        }
      } else { // 跳转
        t = setTimeout(function () {
          var class_time = parseInt($this.attr('class_time'));
          jumpToDistributionTableWithClasstime(class_time)
        }, 250);
      }
    } else if ($this.hasClass('selected')) { // 已选择，无动作
    } else {
      $this.addClass('selected');
      $class_time_selected = $this;
    }
    clicktime = newClicktime;
  })

  //　
  var $course_divide1_select_week = $('#course_divide1_select_week');
  $course_divide1_select_week.change(function () {
    drawDistributionTable()
  })

  // 单击已分配课时的跳转
  function jumpToDistributionTableWithClasstime(class_time) {
    var data_group = data_group_by_ctime[class_time]
    if (!data_group) return;
    // var time_quant = data_group.time_quant
    // if (!time_quant) return;
    // var week = parseInt(time_quant.slice(0, 2));
    if (!data_group.wdt) return;
    var week = data_group.wdt.week;
    var raw_select = $course_divide1_select_week.get(0)
    raw_select.selectedIndex = week - 1;
    $course_divide1_select_week.change()
  }

  // 课时表项点击处理
  var $distribution_table = $('#distribution-table');
  $distribution_table.on('click', 'td', function () {
    // console.log("$distribution_table.on('click', 'td')");
    if (!distributeEditMode) return;
    if (!$class_time_selected) return;
    var $this = $(this);
    var conquer = $this.attr('conquer');
    if (conquer) return;

    var week = parseInt($('option:selected', $course_divide1_select_week).attr('week'));
    var day = parseInt($this.attr('day'));
    var time = parseInt($this.attr('time'));
    var class_time = parseInt($class_time_selected.attr('class_time'));
    // console.log(week, day, time)
    if (isNaN(day) || isNaN(time) || isNaN(class_time)) return;
    $class_time_selected.removeClass('selected').addClass('distributed');
    $class_time_selected = null;
    // var wl = week.length;
    // var time_quant = week.slice(wl - 2, wl) + day + time;
    // data_group_by_ctime[class_time].time_quant = time_quant;
    data_group_by_ctime[class_time].wdt = {
      week: week,
      day: day,
      time: time
    }
    data_group_by_ctime[class_time].dom = $this
    $this.text(class_time);
    $this.attr('conquer', 1);
  });


  // 课时分配表保存
  $('#save-distribution').click(function () { // 获取数据保存
    // console.log("$('#save-distribution').click")
    if (distributeEditMode) { // 编辑模式
      swal({
        title: 'Are you sure?',
        text: '真的要保存了哦……',
        icon: 'info',
        buttons: true,
        dangerMode: true
      })
        .then(function (ok) {
          if (ok) {
            // todo 把 data_group_by_ctime 打包发回去
            var data = []
            _.each(data_group_by_ctime, function (group, ctime) {
              var time_quant = '';
              var wdt = group.wdt;
              if (wdt) {
                time_quant = weekDaytoDate(wdt) + ' ' + ('0' + wdt.time).slice(-2);
              }
              _.each(group, function (elem) {
                elem.time_quant = time_quant;
                data.push(elem);
              })
            });
            // console.log(data);
            api.experiment.updateExperiment(data)
              .done(function (data) {
                // console.log(data);
                if (data.status === 0) {
                  swal('修改成功了', '大概……', 'success');
                } else {
                  g.fetch_err(data)
                }
              }).fail(g.net_err);
            $edit_distribution.click() // 触发编辑按钮的点击，关闭编辑模式
          } else {
          }
        })
    } else {
      swal('这样可不行！', '请在编辑模式下保存！', 'warning')
    }
  });



  // 2、批次工序排课查询

  // 获取所有工种
  function fillProcedOptions() {
    api.proced.getAllProced()
      .done(function (data) {
        if (data.status === 0) {
          var data_arr = data.data;
          var $temp = $('<p>')
          $('<option>选择工种</option>').appendTo($temp)
          _.each(data_arr, function (val) {
            $('<option>').text(val).appendTo($temp)
          })
          $('#seach_clazzes_select_process').html($temp.html());
        } else {
          g.fetch_err(data)
        }
      }).fail(g.net_err)
  }

  // 根据实习批次查询课表【数据返回格式需要修改】

  $('#query-by-batch-button').click(function () {
    var batch_name = $('#seach_clazzes_select_batch1').val()
    if (batch_name && batch_name !== '实习批次选择') {
      api.experiment.getExperimentByBatch(batch_name)
        .done(function (data) {
          if (data.status === 0) {
            displayResultByBatch(data.data)
          } else {
            g.fetch_err(data)
          }
        }).fail(g.net_err);
    }
  });

  function time_quant_formated(time_quant) {
    var index_time = parseInt(time_quant.slice(-2));
    var time = ccs.timeRange[index_time]
    return time_quant.slice(0, -3) + '(' + _.range(time, time + ccs.timeRangeStep) + '节)'
  }

  function displayResultByBatch(data) {
    var grouped_data = _.groupBy(data, 'class_time') // 使用class_time分组的数据
    // var class_times = _.keys(grouped_data) // 如果有出现排序问题就把这个keys排序，然后用来索引
    var s_groups = _.sortBy(_.keys(_.groupBy(data, 's_group_id')));

    var s_group_to_i = {}
    _.each(s_groups, function (sg, i) {
      s_group_to_i[sg] = i;
    })

    var $table_head = $('thead', '#query-by-batch-result').empty();

    var $tr = $('<tr>').html('<th>课时\\组号</th>')
    _.each(s_groups, function (sg, i) {
      $('<th>').text(sg).appendTo($tr)
    });
    $tr.appendTo($table_head)

    var $table_body = $('tbody', '#query-by-batch-result').empty();
    _.each(grouped_data, function (group_data, class_time) {
      $tr = $('<tr>') // 需要计算出课时对应的时间
      var time_quant = group_data[0].time_quant;
      // var time_quant_arr = parse_time_quant(time_quant);
      $('<td>').text('' + class_time + "->" + time_quant_formated(time_quant)).appendTo($tr)
      var td_datas = []
      td_datas.length = s_groups.length;
      _.each(group_data, function (data, i) {
        td_datas[s_group_to_i[data.s_group_id]] = data.pro_name;
      });
      _.each(td_datas, function (data, i) {
        $('<td>').text(data || '').appendTo($tr);
      })
      $tr.appendTo($table_body);
    });
  }

  $('#print-query-by-batch-table').click(function () {
    // console.log("$('#print-query-by-batch-table').click")
    var $table = $('#query-by-batch-result');
    var $trs = $('tr', $table);
    var data = []

    $trs.each(function (i) {
      var row = []
      if (i !== 0) {
        $('td', this).each(function () {
          row.push($(this).text());
        });
      } else {
        $('th', this).each(function (i) {
          row.push($(this).text())
        })
      }
      data.push(row)
    });
    // console.log(data)
    api.experiment.send_download_excel(data);
  });

  // 根据工种和实习批次查询课表 
  $('#query-by-batch-and-proced-button').click(function () {
    // console.log("$('#query-by-batch-and-proced-button').click")
    var batch_name = $('#seach_clazzes_select_batch2').val();
    var pro_name = $('#seach_clazzes_select_process').val();
    if (batch_name && batch_name !== '实习批次选择') {
      var handle = null;
      if (pro_name && pro_name !== '选择工种') {
        handle = api.experiment.getExperimentByBatchAndProced(batch_name, pro_name);
      } else {
        handle = api.experiment.getExperimentByBatch(batch_name);
      }
      handle.done(function (data) {
        if (data.status === 0) {
          displayResultByBatchAndProced(data.data)
        } else {
          g.fetch_err(data)
        }
      }).fail(g.net_err);
    }
  });

  function displayResultByBatchAndProced(data) {
    var $table_body = $('#query-by-batch-and-proced-result').empty();

    var $table_head = $('#query-by-batch-and-proced-head').empty();
    var $tr = $('<tr>');
    $('<th>课时\\工种</th>').appendTo($tr);
    var proceds = _.keys(_.groupBy(data, 'pro_name')); // 按拿出所有的工序
    _.each(proceds, function (val, i) {
      $('<th>').text(val).appendTo($tr);
    });
    $tr.appendTo($table_head);

    data = _.groupBy(data, 'class_time') // 按课时分组
    // console.log(data)
    _.each(data, function (class_group, class_time) {
      var time_quant = class_group[0].time_quant;
      $tr = $('<tr>');
      $('<td>').text('' + class_time + "->" + time_quant_formated(time_quant)).appendTo($tr);

      var proced_groups = _.groupBy(class_group, 'pro_name');
      // console.log(proced_groups);
      _.each(proceds, function (proced, i) {
        var s_groups = proced_groups[proced];
        var $td = $('<td>');
        if (s_groups) {
          var groups = _.map(s_groups, 's_group_id')
          $td.text(groups.join(','));
        }
        $td.appendTo($tr);
      });
      $tr.appendTo($table_body);
    });
  }

  $('#print-query-by-batch-proced-table').click(function () {
    var $table = $('#query-by-batch-and-proced-table');
    var $trs = $('tr', $table);
    var data = []

    $trs.each(function (i) {
      var row = []
      if (i !== 0) {
        $('td', this).each(function () {
          row.push($(this).text());
        });
      } else {
        $('th', this).each(function (i) {
          row.push($(this).text())
        })
      }
      data.push(row)
    });
    // console.log(data)
    api.experiment.send_download_excel(data);
  });

  // 3、学生分组

  // 学生分组
  $('#group-student-button').click(groupStudent)
  function groupStudent() {
    var batch_name = $('#student_divide_select_batch1').val();
    if (batch_name !== "实习批次选择") {
      api.studentGroup.groupStudent(batch_name)
        .done(function (data) {
          if (data.status === 0) {
            // console.log(data);
            swal(
              '分组成功',
              String(data.message),
              'success'
            );
          }
          else {
            g.fetch_err(data)
          }
        }).fail(g.net_err);
    }
    else {
      swal(
        '请先选择批次',
        '请选择批次后再进行分组操作！',
        'warning'
      );
    }
  }


  // 根据批次获取对应的分组号
  function getAllSGroupByBatch() {
    var batch_name = $('#student_divide_select_batch2').val();
    var $selector = $('#student_divide_select_group').empty()
    $('<option></option>').text('组号').appendTo($selector)
    if (batch_name !== "实习批次选择") {

      api.batch.getAllSGroup(batch_name)
        .done(function (data) {
          if (data.status === 0) {
            console.log(data);
            var data_arr = data.data;
            data_arr = _.sortBy(data_arr)
            _.each(data_arr, function (val, i) {
              $('<option></option>').text(val).appendTo($selector)
            });
          } else {
            g.fetch_err(data)
          }
        }).fail(g.net_err);
    }
  }

  $('#student_divide_select_batch2').change(getAllSGroupByBatch);

  $('#get-student-list-by-batch-and-group').click(function () {
    var sgroup = $('#student_divide_select_group').val();
    var batch_name = $('#student_divide_select_batch2').val();
    // console.log(batch_name,sgroup)
    if (batch_name && batch_name !== '实习批次选择') {
      var promise = null;
      if (sgroup && sgroup !== '组号') {
        promise = api.student.getStudentByBatchAndSGroup(batch_name, sgroup);
      } else if (sgroup = '组号') {  // 查出全部
        promise = api.student.getStudentByBatchName(batch_name);
      }
      if (promise) {
        promise.done(function (data) {
          if (data.status === 0) {
            displayGroupStudentResult(data.data)
          } else {
            g.fetch_err(data)
          }
        }).fail(g.net_err)
      }
      return;
    }
    swal('无效查询', '请填写正确的信息', 'warning')
  });

  // var student_group_data = []
  function displayGroupStudentResult(data) {
    // console.log('displayGroupStudentResult')
    var $table_body = $('#student-group-result').empty();
    data = _.sortBy(data, 'sid');
    var $student_select_group = $('#student_divide_select_group')
    // console.log(data)
    _.each(data, function (student, i) {
      var $tr = $('<tr>');
      $('<td>').text(student.sid).addClass('sid').appendTo($tr)
      $('<td>').text(student.sname).appendTo($tr)
      $('<td>').text(student.clazz).appendTo($tr)
      $('<td>').text(student.batch_name).appendTo($tr)
      var grouptd = $('<td>').text(student.s_group_id);
      grouptd.appendTo($tr)
      var btn_td = $('<td>');
      $('<button>').text('切换分组').addClass('btn btn-sm btn-background1 btn-single switch-sgroup').appendTo(btn_td);
      btn_td.appendTo($tr);
      $tr.appendTo($table_body);
    })
    CutPage.cutPage('student-grouped-table', pageSize);
  }

  $('#student-group-result').on('click', 'button.switch-sgroup', function () {
    var $this = $(this);
    var $student_select_group = $('#student_divide_select_group').clone();
    var $ptr = $this.parent().parent()
    var sid = $('.sid', $ptr).text();
    $(':first', $student_select_group).remove();
    swal({
      title: '请选择分组',
      content: $student_select_group[0],
      buttons: true,
      dangerMode: true
    }).then(function (ensure) {
      if (ensure) {
        if (!ensure) return;
        var s_group_id = $student_select_group.val();
        console.log(sid, s_group_id);
        api.student.updateGroup(sid, s_group_id)
          .done(function (data) {
            if (data.status === 0) {
              swal(
                '操作成功', String(data.message),
                'success'
              );
              $ptr.children().eq(4).text(s_group_id);
            } else {
              g.fetch_err(data)
            }
          }).fail(g.net_err);
      }
    })
  })

  $('#print-student-grouped-table').click(function () {
    var $table = $('#student-grouped-table');
    var $trs = $('tr', $table);
    var data = []

    $trs.each(function (i) {
      var row = []
      if (i !== 0) {
        $('td', this).each(function (j) {
          if (j === 4) {
            row.push($('select', this).val());
          }
          else if (j == 5) { }
          else row.push($(this).text())
        });
      } else {
        $('th', this).each(function (j) {
          if (j !== 5)
            row.push($(this).text())
        })
      }
      data.push(row)
    });
    // console.log(data)
    api.experiment.send_download_excel(data);
  })

  // 4、学生课表查询
  // 根据学生学号查询课表
  $('#student-class-query-btn').click(getStuClassTableByNum);
  function getStuClassTableByNum() {
    var sid = $('#search_stu_by_number').val();
    console.log(sid)
    if (sid) {
      api.experiment.getClass(sid)
        .done(function (data) {
          if (data.status === 0) {
            console.log(data);
            var data_arr = data.data;
            var $table_body = $('#search_stu_tbody').empty();
            data_arr = _.sortBy(data_arr, 'time_quant');
            _.each(data_arr, function (val, i) {
              var $tr = $('<tr>');
              $('<td>').text((val.class_time || (i + 1)) + "->" + time_quant_formated(val.time_quant)).appendTo($tr);
              $('<td>').text(val.pro_name).appendTo($tr);
              $('<td>').text(val.batch_name).appendTo($tr);
              $('<td>').text(val.s_group_id).appendTo($tr);
              $tr.appendTo($table_body);
            })
          } else {
            g.fetch_err(data);
          }
        }).fail(g.net_err);
    }
  }


  // 打印学生课表
  $('#print-stud-class-table').click(function () {
    var $table = $('#query_stud-class-table');
    var $trs = $('tr', $table);
    var data = []
    $trs.each(function (i) {
      var row = []
      if (i !== 0) {
        $('td', this).each(function () {
          row.push($(this).text());
        });
      } else {
        $('th', this).each(function (i) {
          row.push($(this).text())
        })
      }
      data.push(row)
    });
    // console.log(data)
    api.experiment.send_download_excel(data);
  });




  // 5. 特殊学生页面
  function fillScoreTemplateOptions() {
    var temp_selector = $('#score-template-selector').empty()
    $('<option>').text('权重模版选择').appendTo(temp_selector);
    api.proced.findAllTemplate()
      .done(function (data) {
        if (data.status === 0) {
          data = data.data;
          _.each(data, function (val) {
            $('<option>').text(val).appendTo(temp_selector);
          });
        } else {
          g.fetch_err(data)
        }
      }).fail(g.net_err)
  }

  var spec_stud = null;
  $('#special_stu_search_stu').click(function () {
    // console.log("$('#special_stu_search_stu').click")
    var stud_id = $('#spec_stud_id').val();
    if (stud_id)
      stud_id = stud_id.trim()
    if (stud_id) {
      api.student.getStudent(stud_id)
        .done(function (data) {
          if (data.status === 0) {
            fill_student_result(data.data)
            spec_stud = data.data;
          } else {
            g.fetch_err(data)
          }
        }).fail(g.net_err);
    }
  });

  function fill_student_result(data) {
    var $tbody = $('#query-student-result').empty();
    // console.log(data);
    var $tr = $('<tr>');
    $('<td>').text(data.sid).appendTo($tr);
    $('<td>').text(data.sname).appendTo($tr);
    $('<td>').text(data.clazz).appendTo($tr);
    $('<td>').text(data.batch_name).appendTo($tr);
    $tr.appendTo($tbody);
  }

  $('#add-to-special-stud').click(addToSpecialStud)

  function addToSpecialStud() {
    var temp_name = $('#score-template-selector').val()
    if (!temp_name || temp_name == '权重模版选择') return;
    if (spec_stud) {
      api.student.addSpStudent(spec_stud.sid, temp_name)
        .done(function (data) {
          if (data.status === 0) {
            swal('添加成功', data.message, 'success');
            spec_stud = null;
            $('#query-student-result').empty();
          } else {
            g.fetch_err(data);
          }
        }).fail(g.net_err);
    }
  }

  $('#query-spec-stud-id-button').click(function () {
    // console.log("$('#query-spec-stud-id-button').click")
    var stud_id = $('#query-spec-stud-id').val().trim();
    $('#query-spec-stud-id-button').attr('sid', stud_id);
    console.log($('#query-spec-stud-id-button').attr('sid'))

    if (stud_id === '') { // 查询所有
      // console.log('get all sp student');
      api.student.getAllSpStudent()
        .done(function (data) {
          if (data.status === 0) {
            fillSpStudentRecords(data.data)
          } else {
            g.fetch_err(data);
          }
        }).fail(g.net_err);
    } else { // 查一个
      api.student.getSpStudentById(stud_id)
        .done(function (data) {
          if (data.status === 0) {
            fillSpStudentRecords([data.data]) // todo check api
          } else {
            g.fetch_err(data);
          }
        }).fail(g.net_err);
    }
  });

  function fillSpStudentRecords(data) {
    // console.log(data)
    var $table = $('#query-spstudent-result').empty();
    _.each(data, function (val, i) {
      var $tr = $('<tr class="sid-row"></tr>').attr('data-sid', val.sid);
      $('<td></td>').text(val.sid).appendTo($tr);
      $('<td></td>').text(val.sname).appendTo($tr);
      $('<td></td>').text(val.clazz).appendTo($tr);
      $('<td></td>').text(val.template_name).appendTo($tr);
      $('<td><div class="operate-center">' +
        '<img src="../icon/edit.svg" class="row-image lookup-course">' +
        '<img src="../icon/delete.svg" class="row-image delete-sp-stud no-padding"> ' +
        '<div class="clearfix"></div> ' +
        '</div>' +
        '</td></tr>').appendTo($tr);

      // $('<td><input type="button" class="btn btn-sm btn-success lookup-course" value="查看&编辑" ><input type="button" class="btn btn-sm btn-danger delete-sp-stud" name="" value="删除"></td>').appendTo($tr)
      $('<td class="center"><input type="checkbox" class="batch_op"></td>').appendTo($tr);
      $tr.appendTo($table);
    });
    CutPage.cutPage('special-table', pageSize);
  }

  // 删除一个特殊学生
  $('#query-spstudent-result').on('click', 'img.delete-sp-stud', function () {
    console.log(this)
    var input = $(this);
    var tr = $(input).parents('tr')
    var sid = tr.attr('data-sid');
    console.log(sid)
    swal({
      title: '请确认',
      text: '将删除学生' + sid,
      icon: 'warning',
      buttons: ["取消", '确定'],
      dangerMode: true
    }).then(function (ensure) {
      if (!ensure) return;

      api.student.deleteSpStudentById([sid])
        .done(function (data) {
          if (data.status === 0) {
            swal(
              '通知',
              data.message,
              'success'
            );
            $('#query-spec-stud-id-button').click();
          } else {
            g.fetch_err(data)
          }
        })
        .fail(g.net_err)
    });
  });

  // 批量删除特殊学生
  $('#del_selected_sp_studs').click(function () {
    var $checked = $('#query-spstudent-result').find('.batch_op').filter(':checked');
    var $checked_rows = $checked.parents('.sid-row');
    console.log($checked_rows)
    var sp_sid = []
    $checked_rows.each(function (i, dom) {
      sp_sid.push($(dom).attr('data-sid'))
    });
    console.log(sp_sid);
    swal({
      title: '请确认',
      text: '将删除学生' + sp_sid,
      icon: 'warning',
      buttons: ["取消", '确定'],
      dangerMode: true
    }).then(function (ensure) {
      if (!ensure) return;
      api.student.deleteSpStudentById(sp_sid)
        .done(function (data) {
          if (data.status === 0) {
            swal(
              '通知',
              data.message,
              'success'
            );
            $('#query-spec-stud-id-button').click();
          } else {
            g.fetch_err(data)
          }
        })
        .fail(g.net_err)
    });
  });


  // 查看、编辑课表
  $('#query-spstudent-result').on('click', 'img.lookup-course', function () {
    console.log(this)
    var input = $(this);
    var tr = $(input).parents('tr')
    var sid = tr.attr('data-sid');
    init_selected_course(sid);
    $('#edit-specialStudentSchedule').modal('show');
  });

  var spec_courses = [];
  var selected_course = {};
  var del_selected_courses = {};
  var new_courses = {};
  var operator_courses = {};
  var edit_sid = null;

  function init_selected_course(sid) {
    console.log("function init_selected_course(sid)")
    // console.log(sid) 
    // 辅助数据初始化
    selected_course = {};
    del_selected_courses = {};
    new_courses = {};
    operator_courses = {};
    edit_sid = null;
    api.specialScore.getClassBySid(sid)
      .done(function (data) {
        if (data.status === 0) {
          var data_arr = data.data;
          selected_course = _.keyBy(data_arr, 'time_quant')
          // console.log(selected_course)
          operator_courses = _.clone(selected_course)
          edit_sid = sid;
          fill_selected_course(selected_course)
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }

  // 填充
  function fill_selected_course(selected_course) {
    var $tbody = $('#spec-selected-course-table tbody').empty();
    var $temp = $('#for_selected_course').children();
    var time_data_s = _.sortBy(_.toPairs(selected_course), function (p) { return p[0] });
    _.each(time_data_s, function (time_data, i) {
      var $cloneTemp = $temp.clone();
      $cloneTemp.attr('time_quant', time_data[0])
        .find('.time').text(time_quant_formated(time_data[0])).end()
        .find('.proced').text(time_data[1].pro_name);
      $cloneTemp.appendTo($tbody)
    })
    CutPage.cutPage('spec-selected-course-table', pageSize);
  }

  var $spec_student_batch_selector = $('#spec-student-batch-selector');
  $spec_student_batch_selector.change(function () {
    // console.log($spec_student_batch_selector.val())
    batch_name = $spec_student_batch_selector.val()
    if (batch_name && batch_name !== '实习批次选择') {
      api.experiment.getExperimentByBatch(batch_name)
        .done(function success(data) {
          if (data.status === 0) {
            // console.log(data.data)
            fillSpecBatchCourseTable(data.data)
          } else {
            g.fetch_err(data)
          }
        }).fail(g.net_err);
    }
  });


  function fillSpecBatchCourseTable(data) {
    var $table = $('#spec-batch-course-table');
    var $tbody = $('tbody', $table).empty();
    var time_groups = _.groupBy(data, 'time_quant');
    var sorted_time_groups = spec_courses = _.sortBy(_.toPairs(time_groups), function (p) { return p[0] });
    // console.log(sorted_time_groups)
    var $temp = $('#for_spec_batch_course').children();
    _.each(sorted_time_groups, function (time_group, i) {
      var $cloneTemp = $temp.clone().attr('i', i);
      var $proceds = $cloneTemp.find('.time').text(time_quant_formated(time_group[0])).end().find('.proceds');
      _.each(time_group[1], function (course, j) {
        $proceds.append($('<button class="btn btn-sm btn-outline for-add"></button>').text(course.pro_name).attr('j', j))
      });
      $cloneTemp.appendTo($tbody)
    })
    CutPage.cutPage('spec-batch-course-table', pageSize);
  }


  $('#spec-batch-course-table').on('click', '.for-add', function () {
    var $this = $(this);
    var j = $this.attr('j');
    var i = $this.parents('tr.class-time').attr('i');
    // console.log(i, j)
    var time = spec_courses[i][0];
    var for_add = spec_courses[i][1][j];
    console.log(for_add);
    new_courses[time] = operator_courses[time] = for_add;
    if (selected_course[time] && new_courses[time] && selected_course[time].pro_name == new_courses[time].pro_name) {
      // 不需要添加原有数据
      delete new_courses[time];
    }
    if (selected_course[time] && operator_courses[time] && selected_course[time].pro_name !== operator_courses[time].pro_name) { // 被添加的数据不是原来的数据
      del_selected_courses[time] = {
        id: selected_course[time].sp_scoreid,
        course: selected_course[time]
      }
    } else { // 原来的数据不需要被删除
      delete del_selected_courses[time];
    }
    fill_selected_course(operator_courses);
  });

  $('#spec-selected-course-table').on('click', '.del-btn', function () {
    // console.log("$('#spec-selected-course-table').on('click')")
    var $this = $(this);
    var time = $this.parents('tr.time-quant').attr('time_quant');
    delete new_courses[time];
    delete operator_courses[time];
    if (selected_course[time]) {
      del_selected_courses[time] = {
        id: selected_course[time].sp_scoreid,
        course: selected_course[time]
      }
    }
    fill_selected_course(operator_courses);
  });

  // 打印更改
  $('#log-data').click(function () {
    // console.log('del', _.map(del_selected_courses, 'course'));
    // console.log('new', _.map(new_courses));
    var for_del = _.map(del_selected_courses, function (d) {
      return time_quant_formated(d.course.time_quant) + ":" + d.course.pro_name;
    });

    var for_new = _.map(new_courses, function (n) {
      return time_quant_formated(n.time_quant) + ':' + n.pro_name;
    });
    swal(
      '提示更改',
      '将删除 \n' + for_del.join('\n') + '\n' + '将添加\n' + for_new.join('\n')
    );
  });

  $('#spec_save_change').click(function () {
    if (!edit_sid) return;
    api.specialScore.deleteClass(_.map(del_selected_courses, 'id'))
      .done(function (data) {
        if (data.status === 0) {
          console.log('删除原有课时成功');
          var res = []
          var count = 0
          var new_courses_arr = _.map(new_courses)
          _.each(new_courses_arr, function (course, i) {
            api.specialScore.addClass(edit_sid, course.pro_name, null, course.time_quant)
              .done(function (data) {
                if (data.status === 0) {
                  res[i] = true;
                } else {
                  res[i] = false;
                }
                count++;
                if (count == new_courses_arr.length) {
                  var all = _.every(res);
                  if (all)
                    swal('修改成功', '请查看课表确认', 'success');
                  else
                    swal('修改失败', '请重试或联系管理员', 'error');
                }
              }).fail(g.net_err);
          });
        }
      }).fail(g.net_err);
  });
});