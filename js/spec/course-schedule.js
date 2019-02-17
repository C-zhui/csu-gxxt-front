require(['jquery', 'lodash', 'swal', 'api/apiobj', 'config/global', 'api/group', 'api/experiment'], function ($, _, swal, api, g) {

  $(document).ready(function () {
    init_data()
  })

  // var base_url = 'http://134.175.152.210:8084';

  // 初始化页面数据
  function init_data() {
    // 获取所有模版并渲染
    // console.log('init')
    updateTemplateSelector()
  }

  var templates = []

  function updateTemplateSelector() {
    // console.log('updateTemplateSelector')
    api.experiment.getAllTemplates()
      .done(function (data) {
        if (data.status == 0) {
          var $alltemplates = $('#template-selector').empty()
          //(data)
          templates = data.data;
          _.forEach(templates, function (d, i) {
            $("<option></option>").text(d).attr('i_template', i).appendTo($alltemplates)
          })
          fetchAndUpdateTemplateTable()
        } else {
          g.fetch_err(data)
        }
      }).fail(g.net_err)
  }

  function fetchAndUpdateTemplateTable() {
    // console.log('updateTemplateTable')
    var i_temp = parseInt($('#template-selector :selected').attr('i_template'))
    // console.log(i_temp)
    var temp_id = templates[i_temp]
    // console.log(temp_id)
    api.experiment.getTemplate(temp_id)
      .done(function (data) {
        if (data.status === 0) {
          data = data.data
          fillCurrentTemplate(data)
          updateTemplateTable(data)
        } else {
          g.fetch_err(data)
        }
      }).fail(g.net_err)
  }

  // 切换模版时
  $('#template-selector').change(function () {
    // console.log('allTemplates change')
    modelData = []
    fetchAndUpdateTemplateTable()
  })


  var currentTemplate = {}
  var modelData = []
  var student_groups = []


  function fillCurrentTemplate(data) {
    currentTemplate = {}
    for (var i = 0; i < data.length; i++) {
      var d = data[i]
      if (d.s_group_id === null) continue;
      if (!currentTemplate[d.s_group_id])
        currentTemplate[d.s_group_id] = []
      currentTemplate[d.s_group_id][d.class_time] = d
    }
  }


  function set_template_head() {
    var $head = $("#template-thead").empty();
    var $tr = $('<tr></tr>')
    $("<th></th>").appendTo($tr)
    _.each(student_groups, function (g) {
      $("<th></th>").attr('s_group_id', g).text(g).appendTo($tr)
    });
    $tr.appendTo($head)
  }

  function toMatrix() {
    var _groupMap = {}
    modelData = _.map(modelData, function () { return [] })
    _.each(student_groups, function (elem, ind) {
      _groupMap[elem] = ind + 1
    });
    _.each(currentTemplate, function (groupstemp, g) {
      var a = currentTemplate[g]
      var gi = _groupMap[g]
      _.each(a, function (val, ind) {
        if (!val) return;
        if (!modelData[ind]) modelData[ind] = []
        modelData[ind][gi] = val
      })
    });
    return modelData;
  }

  function set_template_tbody() {
    // console.log('set_template_tbody')
    var $tbody = $("#template-tbody").empty();
    if (modelData.length == 0) return;
    var cols = student_groups.length + 1
    for (var i = 1; i < modelData.length; i++) {
      var row = modelData[i]
      var $tr = $('<tr></tr>')
      $('<th></th>').attr('class-time-header', i).text(i).appendTo($tr)
      for (var j = 1; j < cols; j++) {
        var $td = $('<td></td>').attr('group', j).attr('class-time', i)
        if (row && row[j])
          $td.text('<' + row[j].t_group_id + ',' + row[j].pro_name + '>')
        $td.appendTo($tr)
      }
      $tr.appendTo($tbody)
    }
  }

  function sortSGroup() {
    // console.log('sortSGroup')
    student_groups = []
    _.each(currentTemplate, function (col, g) {
      if (g)
        student_groups.push(g)
    });
    student_groups.sort()
    // return student_groups
  }

  function updateTemplateTable() {
    sortSGroup()
    set_template_head()
    toMatrix()
    set_template_tbody()
    console.log(modelData)
  }

  // 新建模板
  $('#new-template').click(function () {
    swal({
      content: {
        element: "input",
        attributes: {
          placeholder: "输入新模板名",
        },
      },
      buttons: true
    }).then(function (name) {
      if (name) {
        name = name.trim();
        if (name) {
          var data = [{ "template_id": name }]
          api.experiment.addTemplate(data)
            .done(function (data) {
              if (data.status === 0) {
                swal('消息', '添加模板成功,请在下方编辑模板', 'success')
                updateTemplateSelector()
              } else {
                g.fetch_err(data)
              }
            }).fail(g.net_err)
        }
      } else {
        // console.log('cancel')
      }
    });
  })


  var edit_mode = false;
  var $edit_template_button = $('#edit-template')
  $edit_template_button.click(function () {
    if (edit_mode) {
      edit_mode = false;
      $('#edit-tool').hide()
      $('#table-edit-status').html("")
    } else {
      edit_mode = true;
      update_edit_selectors()
      $('#edit-tool').show()
      $('#table-edit-status').html("编辑模式中")
    }
  })

  var teacher_groups = []
  var teacher_groups_proced = {}

  $('#teacher-selector').change(teacher_groups_change_handler)
  function teacher_groups_change_handler() {
    var $procedSelector = $('#proced-selector').empty();
    var $teacher_group = $('#teacher-selector').val()
    if (!$teacher_group)
      return;
    if (!teacher_groups_proced[$teacher_group])
      setTimeout(teacher_groups_change_handler, 100)
    _.forEach(teacher_groups_proced[$teacher_group], function (val, i) {
      $('<option></option>').text(val).attr('i_proced', i).appendTo($procedSelector)
    })
  }

  function update_edit_selectors() {
    teacher_groups = []
    teacher_groups_proced = {}
    var $teacherGroupSelector = $('#teacher-selector').empty();
    $('#teacher-selector').empty();
    api.group.getAllTeacherGroup()
      .done(function (data) {
        if (data.status === 0) {
          console.log(teacher_groups)
          teacher_groups = data.data
          _.forEach(teacher_groups, function (val, i) {
            $('<option></option>').text(val.t_group_id).attr('i_teachergroup', i).appendTo($teacherGroupSelector)
            api.group.getProcedByGroup(val.t_group_id)
              .done(function (data) {
                if (data.status === 0) {
                  teacher_groups_proced[val.t_group_id] = data.data
                } else {
                  g.fetch_err(data)
                }
              }).fail(g.net_err)
          });
          teacher_groups_change_handler();
        } else {
          g.fetch_err(data)
        }
      });
  }


  $('#add-student-group').click(function () {
    // console.log("$('#add-student-group').click")
    // currentTemplate.push
    swal({
      content: {
        element: "input",
        attributes: {
          placeholder: "输入新分组名",
        },
      },
      buttons: true
    }).then(function (name) {
      if (name) {
        // console.log(name)
        name = name.trim();
        if (name) {
          if (!currentTemplate[name]) {
            currentTemplate[name] = []
          }
          updateTemplateTable()
        }
      } else {
        // console.log('cancel')
      }
    });
  })


  var clicktime = new Date();
  var timeoutid = null;
  $('#template-tbody').on('click', 'td', function () {
    // console.log('#template-tbody td : clicked')
    if (!edit_mode) return;
    var $td = $(this);
    var newClickTime = new Date();

    var tempName = $('#template-selector').val();
    var i_t_group_id = parseInt($('#teacher-selector option:selected').attr('i_teachergroup'));
    var t_group_id = teacher_groups[i_t_group_id].t_group_id;
    var i_pro_name = parseInt($('#proced-selector option:selected').attr('i_proced'));
    var pro_name = teacher_groups_proced[t_group_id][i_pro_name]

    var i_group = parseInt($td.attr('group'))
    var i_class_time = parseInt($td.attr('class-time'))
    if (!i_group || !i_class_time) return;
    var s_group_id = student_groups[i_group - 1]

    console.log(newClickTime - clicktime)
    if (newClickTime - clicktime < 200) {
      console.log('double');
      if (timeoutid)
        clearTimeout(timeoutid)
      $td.empty();
      currentTemplate[s_group_id][i_class_time] = null;
      clicktime = newClickTime;
      return;
    }

    clicktime = newClickTime;
    if (!t_group_id || !tempName || !pro_name) return;
    console.log('single');
    timeoutid = setTimeout(function () {
      currentTemplate[s_group_id][i_class_time] = {
        template_id: tempName,
        t_group_id: t_group_id,
        s_group_id: s_group_id,
        pro_name: pro_name,
        class_time: i_class_time
      }
      $td.text('<' + t_group_id + ',' + pro_name + '>')
    }, 200);
  });


  $('#template-table').on('click', 'th', function () {
    // console.log('#template-table th : clicked')

    var newClickTime = new Date();
    if (!edit_mode) return;
    if (newClickTime - clicktime < 200) {
      var s_group_id = $(this).attr('s_group_id')
      var class_time_head = $(this).attr('class-time-header')
      if (s_group_id) {
        //(s_group_id)
        swal({
          title: '删除学生分组' + s_group_id,
          buttons: true,
          dangerMode: true
        }).then(function (ifTrue) {
          if (ifTrue) {
            delete currentTemplate[s_group_id]
            modelData = []
            setTimeout(function () {
              updateTemplateTable()
            }, 100);
          }
        });
      } else if (class_time_head) {
        //(class_time_head)
        swal({
          title: '删除课时' + class_time_head,
          buttons: true,
          dangerMode: true
        }).then(function (ifTrue) {
          if (ifTrue) {
            class_time_head = parseInt(class_time_head)
            if (!_.isInteger(class_time_head)) return;
            _.each(currentTemplate, function (group_temp) {
              delete group_temp[class_time_head];
            });
            modelData = []
            setTimeout(function () {
              updateTemplateTable()
            }, 100);
          }
        });
      }
    }

    clicktime = newClickTime;
  });

  $(document).off('keydown');
  $(document).keydown(function (event) {
    if (edit_mode) {
      var key = event.originalEvent.key;
      var teacher_selector = $('#teacher-selector')
      var proced_selector = $('#proced-selector')

      var teacher_selector_raw = teacher_selector.get(0);
      if (!teacher_selector_raw) { // 这个子页面可能被关闭了
        $(document).off('keydown');
        return;
      }
      var proced_selector_raw = proced_selector.get(0);
      var p_indx = proced_selector_raw.selectedIndex;
      var t_ind = teacher_selector_raw.selectedIndex;
      // console.log(p_indx + ',' + t_ind)
      var t_maxindx = teacher_selector.children().length - 1;
      var p_maxindx = proced_selector.children().length - 1;
      if (key == 'q' || key == 'Q') {
        teacher_selector_raw.selectedIndex = t_ind - 1 < 0 ? t_maxindx : t_ind - 1;
        teacher_selector.change()
      } else if (key == 'e' || key == 'E') {
        teacher_selector_raw.selectedIndex = t_ind + 1 > t_maxindx ? 0 : t_ind + 1;
        teacher_selector.change()
      } else if (key == 'a' || key == 'A') {
        proced_selector_raw.selectedIndex = p_indx - 1 < 0 ? p_maxindx : p_indx - 1;
      } else if (key == 'D' || key == 'd') {
        proced_selector_raw.selectedIndex = p_indx + 1 > p_maxindx ? 0 : p_indx + 1;
      }
    } else return;
  });


  $('#add-class-time').click(function () {
    // console.log()
    var new_class_time = modelData.length;
    if (new_class_time == 0) {
      modelData.push([])
      new_class_time++;
    }
    swal({
      title: "请确认?",
      text: "将添加课时" + new_class_time + "，确定吗?",
      icon: "info",
      buttons: true,
    }).then(function (ifAdd) {
      // console.log(ifAdd)
      if (ifAdd) {
        modelData.push([])
        updateTemplateTable()
      } else {
        // console.log('cancel')
      }
    });
  });

  $('#save-template').click(saveTemplate)
  function saveTemplate() {
    if (edit_mode) {
      // edit_mode = false;
      swal({
        title: '请确定?',
        text: '将保存下面的模板',
        icon: 'info',
        buttons: true,
        dangerMode: true
      }).then(function (ifTrue) {
        if (ifTrue) {
          $('#edit-tool').hide()
          var data = []
          _.each(currentTemplate, function (group_data, i, arr) {
            _.each(group_data, function (val) {
              if (val)
                data.push(val)
            })
          })
          api.experiment.modifyTemplate(data)
            .done(function (data) {
              if (data.status === 0) {
                swal({
                  title: '通知',
                  text: '保存成功',
                  icon: 'success',
                });
                $edit_template_button.click();
              } else {
                g.fetch_err(data)
              }
            })
            .fail(g.net_err)

        }
        else {
          // console.log('cancel')
        }
      });
    } else {
      swal({
        title: '注意!',
        text: "请在编辑模式下保存!",
        icon: 'warning'
      })
    }
  }

  $('#delete-template').click(doDeleteTemplate)

  // 删除一个模版
  function doDeleteTemplate() {
    if (edit_mode) {
      swal({
        title: '注意!',
        text: "请先退出编辑模式!",
        icon: 'warning'
      })
    } else {
      var i_template = parseInt($('#template-selector option:selected').attr('i_template'));
      var temp_id
      //(i_template)
      if (_.isInteger(i_template)) {
        temp_id = templates[i_template]
      }
      // console.log(temp_id)
      if (!temp_id) return;
      swal({
        title: '确定删除吗？',
        text: '确定删除吗？你将无法恢复它！',
        icon: 'warning',
        buttons: true,
        dangerMode: true
      }).then(function (ifTrue) {
        if (ifTrue) {
          api.experiment.deleteTemplate(temp_id)
            .done(function success(data) {
              if (data.status === 0) {
                swal(
                  '删除成功',
                  '删除模版成功',
                  'success'
                );
                updateTemplateSelector()
                // 刷新教师值班记录
                // getOverworkByTimeOrProName(); // todo 这是什么东西
              }
              else {
                g.fetch_err(data)
              }
            }).fail(g.net_err);
        } else {
          // console.log('cancel')
        }
      });
    }
  }
})