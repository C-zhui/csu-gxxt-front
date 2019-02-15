require(['jquery', 'lodash', 'api/apiobj', 'util/cut_page3', 'config/global', 'api/group', 'api/proced', 'api/admin', 'api/teacher', 'api/user', 'util/md5'], function ($, _, api, CutPage, g) {


  // var base_url = g.base_url;
  var default_teacher_group = "选择教师组";
  var default_material_group = '选择物料权限';
  const pageSize = 5; //分页每页行数

  function boot_grouper() {
    $('.grouper').on('click', '.toggle-btn', function () {
      var p = $(this).parents('.group').find('.group-detail');
      if (p.is('.d-none')) {
        p.toggleClass('d-none');
        p.slideUp(1);
        p.slideDown();
      } else {
        p.slideUp(function () {
          p.toggleClass('d-none');
        });
      }
    });
  }


  var $templates = $('#templates');
  var $teachergroup_proced_list = $('#teachergroup_proced_list');

  $(document).ready(function () {
    boot_grouper();
    init_page();
  })

  // 1、教师组管理部分

  var t_groups = []
  // 查询所有教师组及每个教师组对应的工序---完成教师组与工序的初始化工作
  function init_page() {
    $('.teacher_group_list').empty();   //初始化清空  

    api.group.getAllTeacherGroup()
      .done(function (data) {
        if (data.status === 0) {
          // console.log(data.data)
          t_groups = data.data
          // 初始化教师组 及 工序列表
          init_teachergroup_proced_list();
          // 初始化教师列表的筛选器
          init_query_selector_list()
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }

  var proced_datas = []
  function init_teachergroup_proced_list() {
    proced_datas = [] //清空
    // 1. 填充基本的教师组
    $teachergroup_proced_list.empty(); //  清空
    var $temp = $templates.find('#t_group_data').children();
    _.each(t_groups, function (t_group, i) {
      var $cloneTemp = $temp.clone();
      $cloneTemp.find('.t_group_name').text(t_group.t_group_id).end()
        .attr('data-t_group-idx', i)
      $cloneTemp.appendTo($teachergroup_proced_list);
      // 2. 请求工序
      // console.log(t_group.t_group_id)
      api.group.getProcedByGroup(t_group.t_group_id)
        .done($.proxy(fill_proced_list, $cloneTemp.find('.group-detail')))
        .fail(g.net_err)
    });
  }


  function fill_proced_list(data) {
    if (data.status === 0) {
      var data_arr = data.data;
      var $this = this;
      var $temp = $templates.find('#proced_data').children();
      _.each(data_arr, function (proced, i) {
        // console.log(proced)
        var $cloneTemp = $temp.clone().find('.pro_name').text(proced).end();
        $cloneTemp.attr('data-proced_datas-idx', proced_datas.length);
        proced_datas.push(proced);
        $cloneTemp.appendTo($this);
      });
    } else {
      g.fetch_err(data)
    }
  }

  // 添加新教师组
  $('#add_new_teachergroup_ensure').click(addNewTeacherGroup);
  function addNewTeacherGroup() {
    var t_group_id = $('#new_semester').val();
    // console.log(new_semester);
    api.group.addGroup(t_group_id)
      .done(function (data) {
        if (data.status === 0) {
          // console.log(data);
          swal(
            '添加成功',
            '添加新教师组成功',
            'success'
          );
          init_page();
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }

  // 修改教师组
  $teachergroup_proced_list.on('click', '.edit_t_group_entry', function () {
    var $this = $(this);
    var index = $this.parents('.t_group_data').attr('data-t_group-idx');
    editTeacherGroup_init(t_groups[index])
    $('#editTeacherGroupModal').modal('show')
  });

  //初始化
  function editTeacherGroup_init(t_group) {
    $('#editTeacherGroupName_old').val(t_group.t_group_id);
    $('#editTeacherGroupName_new').val('');
  }

  // 修改教师组
  $('#edit_tgroup_ensure').click(editTeacherGroupName);
  function editTeacherGroupName() {
    var old_teacher_group_name = $('#editTeacherGroupName_old').val();
    var new_teacher_group_name = $('#editTeacherGroupName_new').val();

    api.group.updateGroup(old_teacher_group_name, new_teacher_group_name)
      .done(function (data) {
        if (data.status === 0) {
          swal(
            '修改成功',
            '修改教师组名成功，你的新教师组名为：' + new_teacher_group_name,
            'success'
          );
          init_page();
        } else {
          g.fetch_err(data);
        }
      })
      .fail(g.net_err);
  }


  // 删除某个教师组
  $teachergroup_proced_list.on('click', '.delete_t_group_entry', function () {
    var $this = $(this);
    var index = $this.parents('.t_group_data').attr('data-t_group-idx');
    swal(
      {
        title: '请确认',
        text: '你将要删除' + t_groups[index].t_group_id,
        icon: 'warning',
        buttons: ['取消', '确定'],
        dangerMode: true
      }
    ).then(function (ensure) {
      if (!ensure) return;
      api.group.delete(t_groups[index].t_group_id)
        .done(function (data) {
          console.log(data)
          if (data.status === 0) {
            swal(
              '删除！',
              '教师组"' + t_groups[index].t_group_id + '"已经被删除。',
              'success'
            );
            // 刷新实习批次信息
            init_page();
          } else {
            g.fetch_err(data)
          }
        })
        .fail(g.net_err)
    });
  });


  // 添加新工序
  $teachergroup_proced_list.on('click', '.new_proced_entry', function () {
    var $this = $(this);
    var index = $this.parents('.t_group_data').attr('data-t_group-idx');
    add_teacher_proced_init(t_groups[index]);
    $('#add_teacher_proced_Modal').modal('show');
  });

  // 添加新工序初始化
  function add_teacher_proced_init(t_group) {
    $('#addProcedToGroup_TeacherGroup').val(t_group.t_group_id);
  }

  // 添加新工序
  $('#add_proced_ensure').click(addNewProcedToGroup);
  function addNewProcedToGroup() {
    var groupName = $('#addProcedToGroup_TeacherGroup').val();
    var proName = $('#addProcedToGroup_Process').val();
    console.log(proName);
    api.proced.addProcedToGroup(groupName, proName)
      .done(function (data) {
        if (data.status === 0) {
          swal(
            '添加成功',
            '添加新工序成功',
            'success'
          );
          init_page();
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }


  // 编辑工序
  $teachergroup_proced_list.on('click', '.edit_proced_entry', function () {
    console.log('click:.edit_t_group_entry')
    var $this = $(this);
    var proced_idx = $this.parents('.proced_data').attr('data-proced_datas-idx');
    var t_group_idx = $this.parents('.t_group_data').attr('data-t_group-idx')
    editOneProcess_init({
      processName: proced_datas[proced_idx],
      teacherGroupName: t_groups[t_group_idx].t_group_id
    })
    $('#editOneProcessModal').modal('show');
  });

  // 编辑某个工序--初始化
  function editOneProcess_init(obj) {
    $('#editOneProcessOldName').val(obj.processName);
    $('#editOneProcessTeacherGroupName').val(obj.teacherGroupName);
  }

  // 编辑某个工序名
  $('#edit_proced_ensure').click(editOneProcess);
  function editOneProcess() {
    var teacherGroupName = $('#editOneProcessTeacherGroupName').val();
    var new_processName = $('#editOneProcessName').val();
    var old_processName = $('#editOneProcessOldName').val();
    api.proced.updateProcedFromGroup(teacherGroupName, old_processName, new_processName)
      .done(function (data) {
        if (data.status === 0) {
          swal(
            '修改成功',
            '修改工序名成功',
            'success'
          );
          init_page();
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }



  // 删除某个工序
  $teachergroup_proced_list.on('click', '.delete_proced_entry', function () {
    console.log('click:.edit_t_group_entry')
    var $this = $(this);
    var proced_idx = $this.parents('.proced_data').attr('data-proced_datas-idx');
    var t_group_idx = $this.parents('.t_group_data').attr('data-t_group-idx')
    delOneProcess({
      t_group_id: t_groups[t_group_idx].t_group_id,
      pro_name: proced_datas[proced_idx]
    })
  });

  function delOneProcess(tgroup_proced) {
    swal({
      title: '请确认',
      text: '确定删除工序"' + tgroup_proced.pro_name + '"吗？你将无法恢复它！',
      icon: 'warning',
      buttons: ['取消', '确定'],
      dangerMode: true
    }).then(function (ensure) {
      if (!ensure) return;
      api.proced.deleteProcedFromGroup(tgroup_proced.t_group_id, tgroup_proced.pro_name)
        .done(function (data) {
          if (data.status === 0) {
            swal(
              '提示',
              '工序"' + tgroup_proced.pro_name + '"已经被删除。',
              'success'
            );
            // 刷新实习批次信息
            init_page();
          } else {
            g.fetch_err(data)
          }
        })
        .fail(g.net_err)
    })
  }


  // 2、教师列表部分

  var default_role_group = '选择角色';
  var roles = ['选择角色', '管理员', '实训教师'];

  var default_overtime_group = '选择开放权限';
  var overtime_privileges = ['选择开放权限', '无', '开放管理'];
  var overtime_privileges_id = {
    '无': 0,
    '开放管理': 1
  }

  // 填充教师组
  var selector_loaded = {}
  function init_query_selector_list() {
    fill_teacher_group_selector();
    fill_role_selector();
    fill_overtime_selector();
    fill_material_auth_selector();
    getAllTeachers();
  }

  function fill_teacher_group_selector() {
    var $temp = $('<p></p>');
    $('<option></option>').text(default_teacher_group).appendTo($temp);
    _.each(t_groups, function (tgroup, i) {
      $('<option></option>').text(tgroup.t_group_id).attr('data-t_group-idx', i).appendTo($temp);
    });
    var html = $temp.html();
    $('.teacher_group_selector').html(html);
    selector_loaded.t_group = true;
  }


  function fill_role_selector() {
    var $role_selector = $('.role_selector').empty();
    var temp = $('<p></p>')
    _.each(roles, function (role) {
      $('<option></option>').text(role).appendTo(temp);
    });
    $role_selector.html(temp.html())
  }

  function fill_overtime_selector() {
    var $overtime_selector = $('.overtime_selector').empty();
    var temp = $('<p></p>')
    _.each(overtime_privileges, function (op) {
      $('<option></option>').text(op).appendTo(temp);
    });
    $overtime_selector.html(temp.html())
  }

  // 填充物料权限
  var material_authes = []
  var material_authes_to_bit = {}; // 保存的位码
  function fill_material_auth_selector() {
    api.teacher.getMaterialAuth()
      .done(function (data) {
        if (data.status === 0) {
          material_authes = data.data
          console.log(material_authes)
          var $material_selector = $('#teacher_list_material_privilege').empty().append($('<option></option>').text(default_material_group));
          _.each(material_authes, function (val, i) {
            $material_selector.append($('<option></option>').text(val).attr('data-material_authes-idx', i))
          });
          // 建立反映射
          material_authes_to_bit = {}
          _.each(material_authes, function (val, i) {
            material_authes_to_bit[val] = 1 << i;
          });
          console.log(material_authes_to_bit);
          selector_loaded.material = true;
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }


  var teachers = []
  function getAllTeachers() {
    api.teacher.getAllTeacher()
      .done(function (data) {
        if (data.status === 0) {
          teachers = data.data;
          // console.log(teachers)
          get_fill_tgroup();
          findTeachers();
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }

  var cnt_tgroups = -1;
  function get_fill_tgroup() {
    cnt_tgroups = 0;
    _.each(teachers, function (teacher, i) {
      api.teacher.getTGroup(teacher.tid)
        .done(function (data) {
          if (data.status === 0) {
            // 直接将数据挂载到teacher对象上
            teacher.t_groups = data.data
            // console.log(teacher)
            cnt_tgroups++;
          } else {
            g.fetch_err(data);
          }
        })
        .fail(g.net_err);
    });
  }


  var teacher_filtered = []
  // 根据教师组、角色、物料权限、加班权限获取教师列表
  $('#query_teacher_with_options').click(findTeachers);
  var t = null;
  function findTeachers() {
    // 检查异步数据是否到位 done
    if (!selector_loaded.material || !selector_loaded.t_group) {
      _.delay(findTeachers, 500);
      return;
    }

    var selected_teacher_groups = $('#teacher_list_teacher_groups').val();
    var selected_role = $('#teacher_list_role').val();
    var selected_material_privilege = $('#teacher_list_material_privilege').val();
    var selected_overwork_privilege = $('#teacher_list_overwork_privilege').val();
    teacher_filtered = teachers;

    // tgroups 没有到位，等
    if (cnt_tgroups != teachers.length) {
      _.delay(findTeachers, 500);
      return;
    }

    // //如果未选择教师组，设置为all
    if (selected_teacher_groups === default_teacher_group) {
    } else {
      // console.log('过滤', selected_teacher_groups);
      teacher_filtered = _.filter(teacher_filtered, function (teacher) {
        return _.includes(teacher.t_groups, selected_teacher_groups);
      });
    }

    //如果未选择角色，设置为all
    if (selected_role === "选择角色") {
    } else {
      teacher_filtered = _.filter(teacher_filtered, function (teacher) {
        return (teacher.role === selected_role);
      });
    }

    //如果未选择物料权限，设置为无
    if (selected_material_privilege === default_material_group) {
    } else {
      teacher_filtered = _.filter(teacher_filtered, function (teacher) {
        return (teacher.material_privilege & material_authes_to_bit[selected_material_privilege]);
      });
    }

    //如果未选择加班权限，设置为无
    if (selected_overwork_privilege === "选择开放权限") {
    } else {
      teacher_filtered = _.filter(teacher_filtered, function (teacher) {
        return (teacher.overtime_privilege === overtime_privileges_id[selected_overwork_privilege]);
      });
    }

    console.log(teacher_filtered);
    fill_teacher_list_tbody(teacher_filtered);
  }

  // 填充教师列表
  var $teacher_list_tbody = $('#teacher_list_table')
  function fill_teacher_list_tbody() {
    var $tbody = $teacher_list_tbody.empty();
    var $temp = $templates.find('#teacher_list_item_data').children();
    _.each(teacher_filtered, function (teacher, i) {
      var $cloneTemp = $temp.clone().attr('data-teacher_filtered-idx', i);
      $cloneTemp.find('.tid').text(teacher.tid).end()
        .find('.tname').text(teacher.tname).end()
        .find('.all_group').text('' + teacher.t_groups).end()
        .find('.role').text(teacher.role).end()
      // .find('.material_privilege').text(material_privileges[teacher.material_privilege]);
      $cloneTemp.find('.overtime_privilege').text(overtime_privileges[teacher.overtime_privilege]);
      $cloneTemp.appendTo($tbody);
      // get_fill_tgroup($cloneTemp, teacher);
      trans_fill_material_auth($cloneTemp, teacher);
    });
    // 分页
    CutPage.cutPage('teacher_table', pageSize);
  }

  // 转换显示物料权限
  function trans_fill_material_auth($teacher_row, teacher) {
    // console.log(teacher.material_privilege);
    var bit_code = teacher.material_privilege;
    var authes = []
    _.each(material_authes, function (val, i) {
      if (bit_code & (1 << i)) {
        authes.push(val);
      }
    });
    $teacher_row.find('.material_privilege').text('' + authes);
  }


  // 添加一个教师
  $('#add_teacher_ensure').click(addOneTeacher);
  function addOneTeacher() {
    var tid = $('#teach-nickname-add').val();
    var tname = $('#teach-name-add').val();
    // var t_group_id = $('#add_modal_teacher_group').val();
    var role = $('#teach-role-add').val();
    // var material_privilege = $('#teach-material_privilege-add').val();
    var overtime_privilege = $('#teach-overtime_privilege-add').val();
    // 判断物料权限
    // material_privilege = material_privileges_id[material_privilege] || ''

    // 判断加班权限

    if (!tid || !tname || role === default_role_group || overtime_privilege === default_overtime_group) {
      swal('', '请完善表单填写', 'warning');
      return;
    }
    overtime_privilege = overtime_privileges_id[overtime_privilege]
    console.log(overtime_privilege)

    api.teacher.addTeacher(tid, tname, role, 0, overtime_privilege)
      .done(function (data) {
        if (data.status === 0) {
          console.log(data);
          swal(
            '添加成功',
            '添加教师信息成功',
            'success'
          );
          getAllTeachers();
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }

  // 删除一个教师
  $teacher_list_tbody.on('click', '.del_teacher_entry', function () {
    var $this = $(this);
    var idx = $this.parents('.teacher_list_item_data').attr('data-teacher_filtered-idx')
    deleteOneTeacher(teacher_filtered[idx]);
  });

  function deleteOneTeacher(teacher) {
    console.log(teacher);
    swal({
      title: '确定删除吗？',
      text: '确定删除' + teacher.tname + '吗？',
      icon: 'warning',
      buttons: ['取消', '确定']
    }).then(function (ensure) {
      if (!ensure) return;
      api.teacher.deleteTeacher([teacher.tid])
        .done(function (data) {
          if (data.status === 0) {
            swal(
              '删除成功',
              '删除教师信息成功',
              'success'
            );
            getAllTeachers();
          } else {
            g.fetch_err(data)
          }
        })
        .fail(g.net_err)
    });
  }

  // 批量删除教师
  $('#delete_selected_teacher').click(deleteSomeTeachers);
  function deleteSomeTeachers() {
    var $checked = $teacher_list_tbody.find('.batch_op').filter(':checked').parents('.teacher_list_item_data');
    //  console.log($checked);
    var teacher_ids = [];
    $checked.each(function (i, dom) {
      var index = $(dom).attr('data-teacher_filtered-idx');
      teacher_ids.push(teachers[index].tid);
    });
    // console.log(teacher_ids);

    swal({
      title: '确定删除吗？',
      text: '确定删除吗？你将无法恢复它们！',
      icon: 'warning',
      buttons: ['取消', '确定']
    }).then(function (ensure) {
      if (!ensure) return;
      api.teacher.deleteTeacher(teacher_ids)
        .done(function (data) {
          if (data.status === 0) {
            swal(
              '删除成功',
              '删除教师信息成功',
              'success'
            );
            getAllTeachers();
          } else {
            g.fetch_err(data)
          }
        })
        .fail(g.net_err)
    })
  }


  var teacher_editing = null;
  // 修改一个教师--初始化
  $teacher_list_tbody.on('click', '.edit_teacher_entry', function () {
    var $this = $(this);
    var idx = $this.parents('.teacher_list_item_data').attr('data-teacher_filtered-idx')
    editOneTeacher_init(teacher_filtered[idx]);
    $('#teacherManage-button-editModal').modal('show')
  });


  function editOneTeacher_init(teacher) {
    teacher_editing = teacher;
    $('#teach_nickname_add').val(teacher.tid);
    $('#teach_name_add').val(teacher.tname);
    $('#teach_role_add').val(teacher.role);
    // 判断物料权限
    // $('#teach_material_privilege_add').val('').val(material_privileges[teacher.material_privilege]);
    // 判断加班权限
    $('#teach_overwork_privilege_add').val('').val(overtime_privileges[teacher.overtime_privilege]);
    if (teacher_editing) {
      init_btn_bar_tgroups();
      init_btn_bar_material_privileges();
    }
  }


  var $edit_teacher_groups = $('#edit_teacher_groups');
  var tgroups_has = {};
  var tgroups_not = {};
  var t_group_ids;
  // 初始化教师编辑的教师组
  function init_btn_bar_tgroups() {
    tgroups_has = {};
    tgroups_not = {};
    console.log(teacher_editing)
    t_group_ids = _.map(t_groups, 't_group_id');
    console.log(t_group_ids);
    _.each(t_group_ids, function (name, i) {
      if (_.includes(teacher_editing.t_groups, name)) {
        tgroups_has[name] = i;
      } else {
        tgroups_not[name] = i;
      }
    });
    redraw_btn_bar_tgroups();
  }

  function redraw_btn_bar_tgroups() {
    $edit_teacher_groups.empty();
    var has = _.keys(tgroups_has);
    var not = _.keys(tgroups_not);
    _.each(has, function (g_name) {
      $('<button class="btn btn-success"></button>').addClass('tgroup has_').attr('data-tgroup', g_name).text(g_name).appendTo($edit_teacher_groups);
    });

    _.each(not, function (g_name) {
      $('<button class="btn btn-danger"></button>').addClass('tgroup').attr('data-tgroup', g_name).text(g_name).appendTo($edit_teacher_groups);
    });
  }

  $edit_teacher_groups.on('click', '.tgroup', function () {
    var $this = $(this);
    var tgroup = $this.attr('data-tgroup');
    console.log(tgroup)
    if ($this.hasClass('has_')) {// 点击了绿色  
      tgroups_not[tgroup] = tgroups_has[tgroup];
      delete tgroups_has[tgroup];
    } else {
      tgroups_has[tgroup] = tgroups_not[tgroup];
      delete tgroups_not[tgroup];
    }
    redraw_btn_bar_tgroups();
  });

  var material_has = {}
  var material_not = {}
  function init_btn_bar_material_privileges() {
    material_has = {}
    material_not = {}
    _.each(material_authes, function (name, i) {
      if (teacher_editing.material_privilege & (1 << i)) {
        material_has[1 << i] = name;
      } else {
        material_not[1 << i] = name;
      }
    });
    redraw_btn_bar_material();
  }

  var $edit_material_privileges = $('#edit_material_privileges');
  function redraw_btn_bar_material() {
    $edit_material_privileges.empty();
    _.each(material_has, function (name, code) {
      $('<button class="btn btn-success"></button>').attr('data-code', code).addClass('material has_').text(name).appendTo($edit_material_privileges);
    });

    _.each(material_not, function (name, code) {
      $('<button class="btn btn-danger"></button>').attr('data-code', code).addClass('material').text(name).appendTo($edit_material_privileges);
    });
  }

  $edit_material_privileges.on('click', '.material', function () {
    var $this = $(this);
    var code = $this.attr('data-code');
    console.log(code)
    if ($this.hasClass('has_')) {// 点击了绿色  
      material_not[code] = material_has[code];
      delete material_has[code];
    } else {
      material_has[code] = material_not[code];
      delete material_not[code];
    }
    redraw_btn_bar_material();
  });


  // 修改一个教师
  $('#edit_teacher_ensure').click(editOneTeacher);
  function editOneTeacher() {
    var tid = $('#teach_nickname_add').val();
    var tname = $('#teach_name_add').val();
    var role = $('#teach_role_add').val();
    // var material_privilege = $('#teach_material_privilege_add').val();
    var overtime_privilege = $('#teach_overwork_privilege_add').val();
    // var t_group_id = $('#teachGroupFormControlSelect').val();
    // 判断物料权限
    // material_privilege = material_privileges_id[material_privilege] || '';
    // 判断加班权限
    overtime_privilege = overtime_privileges_id[overtime_privilege]
    // 计算物料权限位码
    var codes = _.keys(material_has);
    // console.log('codes ',codes);
    codes = _.map(codes, _.toInteger);
    // console.log('codes ',codes);
    var material_privilege = _.sum(codes);
    // console.log('material_privilege ', material_privilege);
    // console.log(tgroups_has)
    var now_tgroups = _.keys(tgroups_has);
    // console.log(now_tgroups)

    var for_del = _.difference(teacher_editing.t_groups, now_tgroups);
    var for_new = _.difference(now_tgroups, teacher_editing.t_groups);
    console.log('del', for_del);
    console.log('new', for_new);
    console.log(material_privilege)

    var cnt = {
      done: false,
      val: 0,
      increment: function (data) {
        if (this.done) return;
        if (data.status === 0) { this.val++; }
        else this.val += for_del.length + for_new.length;

        if (this.val == for_del.length + for_new.length) {
          swal('提示', '信息修改成功', 'success');
          getAllTeachers();
        }
        if (this.val >= for_del.length + for_new.length) {
          this.done = true;
          if (this.val > for_del.length + for_new.length) {
            swal('错误', '信息修改中断', 'error');
            getAllTeachers();
          }
        }
      },
      fail: function (data) {
        this.val += for_del.length + for_new.length;
        this.done = true;
        swal('错误', '信息修改中断', 'error');
        getAllTeachers();
      }
    }

    api.teacher.updateTeacher(tid, tname, now_tgroups[0], role, material_privilege, overtime_privilege)
      .done(function (data) {
        if (data.status === 0) {
          if (for_del.length === 0 && for_new.length === 0) {
            swal('提示', '信息修改成功', 'success');
            getAllTeachers();
          }
          _.each(for_del, function (tgroup) {
            api.teacher.deleteTeacherGroup(tid, tgroup)
              .done(cnt.increment.bind(cnt)).fail(cnt.fail.bind(cnt));
          });
          _.each(for_new, function (tgroup) {
            api.teacher.updateTeacherGroup(tid, tgroup)
              .done(cnt.increment.bind(cnt)).fail(cnt.fail.bind(cnt));
          });
        } else {
          console.log(data);
        }
      })
      .fail(g.net_err)
  }


  // 重置一个教师的密码
  $teacher_list_tbody.on('click', '.reset_teacher_entry', function () {
    var $this = $(this);
    var idx = $this.parents('.teacher_list_item_data').attr('data-teacher_filtered-idx')
    initOneTeacherPassword(teacher_filtered[idx]);
  });

  function initOneTeacherPassword(teacher) {
    swal({
      title: '注意',
      text: '密码将重置为123456',
      buttons: ['取消', '确定'],
      dangerMode: true
    }).then(function (ensure) {
      if (!ensure) return;
      api.user.changePwd(teacher.tid, hex_md5('123456'))
        .done(function (data) {
          if (data.status === 0) {
            swal(
              '重置密码成功',
              data.message,
              'success'
            );
          } else {
            g.fetch_err(data)
          }
        })
        .fail(g.net_err)
    });
  }
});