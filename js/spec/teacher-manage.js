require(['jquery', 'lodash', 'api/apiobj', 'util/cut_page3', 'config/global', 'api/group', 'api/proced', 'api/admin', 'api/teacher', 'api/user', 'util/md5'], function ($, _, api, CutPage, g) {


  var base_url = g.base_url;
  var X1 = "选择教师组";
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
    init_data();
  })

  // 初始化页面数据
  function init_data() {
    // 初始化教师组管理模块
    init_page();
  }

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
          fill_teachergroup_proced_list();
          // 初始化教师列表
          fill_GroupSelector_StuList()
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }

  var proced_datas = []
  function fill_teachergroup_proced_list() {
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
          init_data();
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
          init_data();
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
            init_data();
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
          init_data();
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
          init_data();
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
            init_data();
          } else {
            g.fetch_err(data)
          }
        })
        .fail(g.net_err)
    })
  }





  // 2、教师列表部分

  function fill_GroupSelector_StuList() {
    var $temp = $('<p></p>');
    $('<option></option>').text(X1).appendTo($temp);
    _.each(t_groups, function (tgroup) {
      $('<option></option>').text(tgroup.t_group_id).appendTo($temp);
    });
    var html = $temp.html();
    $('.teacher_group_selector').html(html);
    findTeachers();
  }


  var teachers = []
  // 根据教师组、角色、物料权限、加班权限获取教师列表
  $('#query_teacher_with_options').click(findTeachers);
  function findTeachers() {
    var teacher_list_teacher_groups = $('#teacher_list_teacher_groups').val();
    var teacher_list_role = $('#teacher_list_role').val();
    var teacher_list_material_privilege = $('#teacher_list_material_privilege').val();
    var teacher_list_overwork_privilege = $('#teacher_list_overwork_privilege').val();

    //如果未选择教师组，设置为all
    if (teacher_list_teacher_groups === X1) {
      teacher_list_teacher_groups = "all";
    }
    //如果未选择角色，设置为all
    if (teacher_list_role === "选择角色") {
      teacher_list_role = "all";
    }
    //如果未选择物料权限，设置为无
    if (teacher_list_material_privilege === "物料权限") {
      teacher_list_material_privilege = "all";
    }
    //如果未选择加班权限，设置为无
    if (teacher_list_overwork_privilege === "开放权限") {
      teacher_list_overwork_privilege = "all";
    }

    api.admin.findTeachers(
      teacher_list_teacher_groups,
      teacher_list_role,
      teacher_list_material_privilege,
      teacher_list_overwork_privilege
    ).done(function (data) {
      if (data.status === 0) {
        teachers = data.data;
        fill_teacher_list_tbody();
      } else {
        g.fetch_err(data)
      }
    })
      .fail(g.net_err)
  }


  // 权限id双向映射
  var material_privileges = {
    '0': '无',
    '1': '物料登记',
    '2': '物料申购'
  }
  var material_privileges_id = {
    '无': '0',
    '物料登记': '1',
    '物料申购': '2'
  }

  var overtime_privileges = {
    '0': '无',
    '1': '开放管理'
  }
  var overtime_privileges_id = {
    '无': '0',
    '开放管理': '1'
  }

  // 填充教师列表
  var $teacher_list_tbody = $('#teacher_list_table')
  function fill_teacher_list_tbody() {
    var $tbody = $teacher_list_tbody.empty();
    var $temp = $templates.find('#teacher_list_item_data').children();
    _.each(teachers, function (teacher, i) {
      var $cloneTemp = $temp.clone().attr('data-teachers-idx', i);
      $cloneTemp.find('.tid').text(teacher.tid).end()
        .find('.tname').text(teacher.tname).end()
        .find('.all_group').text(teacher.all_group).end()
        .find('.role').text(teacher.role).end()
        .find('.material_privilege').text(material_privileges[teacher.material_privilege]);
      $cloneTemp.find('.overtime_privilege').text(overtime_privileges[teacher.overtime_privilege])
      $cloneTemp.appendTo($tbody);
    });
    // 分页
    CutPage.cutPage('teacher_table', pageSize);
  }


  // 添加一个教师
  $('#add_teacher_ensure').click(addOneTeacher);
  function addOneTeacher() {
    var tid = $('#teach-nickname-add').val();
    var tname = $('#teach-name-add').val();
    var t_group_id = $('#add_modal_teacher_group').val();
    var role = $('#teach-role-add').val();
    var material_privilege = $('#teach-material_privilege-add').val();
    var overtime_privilege = $('#teach-overtime_privilege-add').val();

    // 判断物料权限
    material_privilege = material_privileges_id[material_privilege] || ''

    // 判断加班权限
    overtime_privilege = overtime_privileges_id[overtime_privilege] || ''

    console.log(material_privilege, overtime_privilege)
    api.teacher.addTeacher(tid, tname, t_group_id, role, material_privilege, overtime_privilege)
      .done(function (data) {
        if (data.status === 0) {
          console.log(data);
          swal(
            '添加成功',
            '添加教师信息成功',
            'success'
          );
          findTeachers();
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }

  // 删除一个教师
  $teacher_list_tbody.on('click', '.del_teacher_entry', function () {
    var $this = $(this);
    var idx = $this.parents('.teacher_list_item_data').attr('data-teachers-idx')
    deleteOneTeacher(teachers[idx]);
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
            findTeachers();
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
      var index = $(dom).attr('data-teachers-idx');
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
            findTeachers();
          } else {
            g.fetch_err(data)
          }
        })
        .fail(g.net_err)
    })
  }


  // 修改一个教师--初始化
  $teacher_list_tbody.on('click', '.edit_teacher_entry', function () {
    var $this = $(this);
    var idx = $this.parents('.teacher_list_item_data').attr('data-teachers-idx')
    editOneTeacher_init(teachers[idx]);
    $('#teacherManage-button-editModal').modal('show')
  });

  function editOneTeacher_init(teacher) {
    // console.log(teacher)
    $('#teach_nickname_add').val(teacher.tid);
    $('#teach_name_add').val(teacher.tname);
    // $('#teach_groups_add').val(all_group);
    $('#teach_role_add').val(teacher.role);
    // 判断物料权限
    $('#teach_material_privilege_add').val('').val(material_privileges[teacher.material_privilege]);
    // 判断加班权限
    $('#teach_overwork_privilege_add').val('').val(overtime_privileges[teacher.overtime_privilege]);
  }

  // 修改一个教师
  $('#edit_teacher_ensure').click(editOneTeacher);
  function editOneTeacher() {
    var tid = $('#teach_nickname_add').val();
    var tname = $('#teach_name_add').val();
    var role = $('#teach_role_add').val();
    var material_privilege = $('#teach_material_privilege_add').val();
    var overtime_privilege = $('#teach_overwork_privilege_add').val();
    var t_group_id = $('#teachGroupFormControlSelect').val();
    // 判断物料权限
    material_privilege = material_privileges_id[material_privilege] || '';
    // 判断加班权限
    overtime_privilege = overtime_privileges_id[overtime_privilege] || ''
    // 判断教师组
    if (t_group_id === "选择教师组") {
      t_group_id = "0";
    }

    api.teacher.updateTeacher(tid, tname, t_group_id, role, material_privilege, overtime_privilege)
      .done(function (data) {
        if (data.status === 0) {
          swal(
            '更新成功',
            '更新教师信息成功',
            'success'
          );
          findTeachers();
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }


  // 重置一个教师的密码
  $teacher_list_tbody.on('click', '.reset_teacher_entry', function () {
    var $this = $(this);
    var idx = $this.parents('.teacher_list_item_data').attr('data-teachers-idx')
    initOneTeacherPassword(teachers[idx]);
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