require(['jquery', 'lodash', 'swal', 'api/apiobj', 'config/global', 'util/cut_page3','api/batch', 'api/student', 'api/user', 'flatpickr', 'util/md5'], function ($, _, swal, api, g,CutPage) {
  var base_url = g.base_url
  const pageSize = 5;//初始化分页单页页数
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

  function init_flatpickr() {
    $('.date-plugin').flatpickr({
      dateFormat: 'Y-m-d'
    })
  }

  $(document).ready(function () {
    boot_grouper();
    init_flatpickr()
    init_data();
  });

  // 初始化页面数据
  function init_data() {
    // 初始化实习批次管理模块
    getAndFillSemesterBatchList();
    // 学生列表初始化批次 + 初始化学生列表
    getAllBatch_StuList();
  }

  var semester_data = [];
  function getAndFillSemesterBatchList() {
    // 获取所有学期名
    api.batch.getAllSemesterName()
      .done(function (data) {
        if (data.status === 0) {
          semester_data = data.data;
          // 过滤重复
          semester_data = _.uniqBy(semester_data, 'semester_name')
          semester_data = _.filter(semester_data, 'semester_name')
          getAndFillBatchList();
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }

  var batches = [];
  function getAndFillBatchList() {
    batches = []; // 重置清空
    var $batch_list = $('#batch_list').empty();
    var $temp = $('#templates #semester_data').children();
    _.each(semester_data, function (val, i) {
      var $cloneTemp = $temp.clone();
      $cloneTemp.find('.semester_name').text(val.semester_name).end()
        .attr('data-semester-index', i)
      $cloneTemp.appendTo($batch_list);
      api.batch.getBatchBySemesterName(val.semester_name)
        .done($.proxy(fillBatchList, $cloneTemp.find('.group-detail')))
        .fail(g.net_err)
    });
  }

  function fillBatchList(data) {
    if (data.status === 0) {
      var data_arr = data.data;
      var $this = this;
      var $temp = $('#templates #batch_data').children();
      _.each(data_arr, function (val, i) {
        var $cloneTemp = $temp.clone().find('.batch_name').text(val.batch_name).end();

        $cloneTemp.attr('data-batch-index', batches.length);
        batches.push(val);
        $cloneTemp.appendTo($this);
      });
    } else {
      g.fetch_err(data)
    }
  }

  // 添加新学期
  $('#addNewSemester-btn').click(add_new_semester);
  function add_new_semester() {
    var semester_name = $('#new_semester_name').val();
    var beginDate = $('#new_semester_beginDate').val();
    if (!semester_name || !beginDate) {
      swal('请完成表单填写', '', 'warning')
      return;
    }
    api.batch.addBatch(semester_name, '', 1, beginDate) // todo check 
      // 后端报错
      .done(function (data) {
        if (data.status === 0) {
          init_data();
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }

  // 触发添加批次对话框事件
  $('#batch_list').on('click', '.new_batch_entry', function () {
    var $this = $(this);
    var index = $this.parents('.semester_data').attr('data-semester-index');
    // console.log(semester_data[index])
    init_new_batch_modal(semester_data[index])
    $('#add_semester_batchModal').modal('show');
  })

  //初始化添加批次编辑区
  function init_new_batch_modal(semester) {
    $('#addNewBatch_semester').val(semester.semester_name);
    $('#addNewBatch_batch').val('');
    $('#addNewBatch_credit').val('');
    $('#addNewBatch_beginDate').val(semester.date); //时间初始化为学期的起始时间，但是可以修改。
  }

  $('#add-new-batch').click(add_batch_ensure);
  function add_batch_ensure() {
    var new_semester = $('#addNewBatch_semester').val();
    var new_semester_batch = $('#addNewBatch_batch').val();
    var new_semester_credit = $('#addNewBatch_credit').val();
    var new_semester_beginDate = $('#addNewBatch_beginDate').val();
    if (!new_semester || !new_semester_batch || !new_semester_credit || !new_semester_beginDate) {
      swal('请完成表单填写', '', 'warning')
      return;
    }
    api.batch.addBatch(new_semester, new_semester_batch, new_semester_credit, new_semester_beginDate)
      .done(function (data) {
        if (data.status === 0) {
          // console.log(data);
          swal(
            '添加成功',
            '添加新批次成功',
            'success'
          );
          init_data();
        } else {
          g.fetch_err(data);
        }
      })
  }

  // 编辑学期点击事件
  var $edit_semester_modal = $('#edit_semester_modal');
  $('#batch_list').on('click', '.edit_semester_entry', function () {
    var $this = $(this);
    var index = $this.parents('.semester_data').attr('data-semester-index');
    init_edit_semester_modal(semester_data[index])
    $edit_semester_modal.modal('show');
  })

  function init_edit_semester_modal(semester) {
    $edit_semester_modal.find('#editSemesterName_old').val(semester.semester_name || '').end()
      .find('#editSemesterName_new').val(semester.semester_name || '').end()
      .find('#editSemesterBeginDate').val(semester.date || '')
  }

  // 编辑确定
  $("#edit_semester_ensure").click(function () {
    var semester_old = $edit_semester_modal.find('#editSemesterName_old').val()
    var semester_new = $edit_semester_modal.find('#editSemesterName_new').val()
    var beginDate = $edit_semester_modal.find('#editSemesterBeginDate').val()
    var promise = null;
    if (semester_old !== semester_new) { // 修改名字先
      promise = api.batch.updateSemesterName(semester_old, semester_new)
    }

    if (promise) {
      promise
        .done(function (data) {
          if (data.status === 0) {
            updateDate(semester_new, beginDate);
          } else {
            g.fetch_err(data)
          }
        })
        .fail(g.net_err)
    } else {
      updateDate(semester_new, beginDate);
    }
  });

  function updateDate(semester_name, beginDate) {
    api.batch.updateBeginDate(semester_name, beginDate)
      .done(function (data) {
        if (data.status === 0) {
          swal(
            '成功',
            data.message,
            'success'
          );
          init_data();
        } else {
          g.fetch_err(data);
        }
      })
      .fail(g.net_err)
  }



  // 删除学期点击事件
  $('#batch_list').on('click', '.delete_semester_entry', function () {
    var $this = $(this);
    var index = $this.parents('.semester_data').attr('data-semester-index');
    // console.log(semester_data[index])
    swal({
      title: '请确定',
      text: '是否删除学期' + semester_data[index].semester_name,
      icon: 'warning',
      buttons: ['取消', '确定'],
      dangerMode: true
    }).then(function (ensure) {
      if (!ensure) return;
      api.batch.deleteSemester(semester_data[index].semester_name)
        .done(function (data) {
          if (data.status === 0) {
            swal('删除成功')
            init_data()
          } else {
            g.fetch_err(data)
          }
        }).fail(g.net_err)
    });
  });

  var $editOneBatchModal = $('#editOneBatchModal');
  // 触发编辑批次对话框
  $('#batch_list').on('click', '.edit_batch_entry', function () {
    var $this = $(this)
    var batch_index = $this.parents('.batch_data').attr('data-batch-index');

    var batch = batches[batch_index]
    // console.log(batch)
    init_edit_onebatch_modal(batch);
    $editOneBatchModal.modal('show');
  });

  // 初始化
  function init_edit_onebatch_modal(batch) {
    $editOneBatchModal.find('#editOneBatchSemesterName').val(batch.semester_name);
    $editOneBatchModal.find('#editOneBatchName').val(batch.batch_name);
    $editOneBatchModal.find('#editOneBatchCredit').val(batch.credit);
    $editOneBatchModal.find('#editOneBatchBeginDate').val(batch.beginDate);
  }

  //提交修改
  $('#editOneBatchCommit').click(function () {
    var semester_name = $editOneBatchModal.find('#editOneBatchSemesterName').val();
    var batch_name = $editOneBatchModal.find('#editOneBatchName').val();
    var credit = $editOneBatchModal.find('#editOneBatchCredit').val();
    var beginDate = $editOneBatchModal.find('#editOneBatchBeginDate').val();
    api.batch.updateBatch(semester_name, batch_name, credit, beginDate)
      .done(function (data) {
        if (data.status === 0) {
          swal('提示', '修改成功', 'success')
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  });

  $('#batch_list').on('click', '.delete_batch_entry', function () {
    var $this = $(this)
    var batch_index = $this.parents('.batch_data').attr('data-batch-index');

    var batch = batches[batch_index]
    // console.log(batch.batch_name);
    delOneBatch(batch);
  });

  // 删除某个批次
  function delOneBatch(batch) {
    var batch_name = batch.batch_name;
    swal({
      title: '确定删除吗？',
      text: '确定删除"' + batch_name + '批次"吗？你将无法恢复它！',
      icon: 'warning',
      dangerMode: true,
      buttons: ['取消', '确定']
    }).then(function (result) {
      api.batch.deleteBatch(batch_name)
        .done(function (data) {
          if (data.status === 0) {
            swal(
              '删除！',
              '"' + batch_name + '批次"已经被删除。',
              'success'
            );
            // 刷新实习批次信息
            init_data();
          } else {
            g.fetch_err(data)
          }
        }).fail(g.net_err)
    })
  }

  // 2、学生信息导入部分
  $('#download_template').click(function (e) {
    downloadTemplate();
  });

  // 下载标准模版
  function downloadTemplate() {
    g.downloads('/admin/download', "GET", {})
  }

  // 上传文件导入学生信息
  $('#import_btn').click(importStudents);
  function importStudents() {
    // console.log($("#uploadfiles").val());
    var formdata = new FormData();
    formdata.append("file", $("#uploadfiles")[0].files[0]);
    var batchName = $('#importStudents_select').val();
    formdata.append("batchName", batchName);
    // console.log(formdata.getAll("file"));
    // console.log(formdata.getAll("batchName"));
    $.ajax({
      url: base_url + "/admin/importStudents",
      type: "post",
      data: formdata,
      cache: false,
      processData: false,
      contentType: false,
      success: function (data) {
        // window.clearInterval(timer);
        // console.log("over..");
        swal(
          '导入成功！',
          '导入学生信息成功！',
          'success'
        );
        // $('#tf').empty();
        // getAllBatch_StuList();
        // window.location.href = "./student-manage.js";
      },
      error: function (e) {
        swal(
          '导入失败！',
          '导入学生信息失败！',
          'success'
        );
        // window.clearInterval(timer);
      }
    });
  }


  // 3、学生列表部分(OK)

  // 获取所有批次 + 根据批次名获取学生列表
  function getAllBatch_StuList() {
    api.batch.getAllBatch()
      .done(function (data) {
        if (data.status === 0) {
          // console.log(data);
          var data_arr = data.data;
          var $temp = $('<p></p>');
          _.each(data_arr, function (val) {
            $temp.append($('<option></option>').text(val.batch_name))
          });
          $('.batch_selector').html($temp.html());
          getStudentByBatchName();
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }

  var student_list = []
  $('#query_student_list_by_batch').click(getStudentByBatchName);
  // 根据批次名获取学生列表
  function getStudentByBatchName() {
    var batch_name = $('#stu_list_batch_name').val();
    var $stu_list_tbody = $('#student_list_body').empty();

    api.student.getStudentByBatchName(batch_name)
      .done(function (data) {
        if (data.status === 0) {
          data_arr = data.data;
          student_list = data_arr;
          var $temp = $('#templates #student_list_item_data').children();
          _.each(data_arr, function (val, i) {
            var $cloneTemp = $temp.clone();
            $cloneTemp.attr('data-stud-idx', i)
              .find('.sid').text(val.sid).end()
              .find('.sname').text(val.sname).end()
              .find('.clazz').text(val.clazz).end()
              .find('.batch_name').text(val.batch_name).end();
            $cloneTemp.appendTo($stu_list_tbody)
          });
          // 初始化分页
            CutPage.cutPage('student_table', pageSize);
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }


  // 添加一个学生
  $('#add_a_student').click(addOneStudent);
  var $add_student_modal = $('#add_student_modal');
  function addOneStudent() {
    var sid = $add_student_modal.find('#stu-number-add').val();
    var sname = $add_student_modal.find('#stu-name-add').val();
    var clazz = $add_student_modal.find('#stu-classes-add').val();
    var batch_name = $add_student_modal.find('#addStudentSelecetBatch').val();

    api.student.addStudent(sid, sname, clazz, batch_name)
      .done(function (data) {
        if (data.status === 0) {
          swal(
            '添加成功',
            '添加学生信息成功',
            'success'
          );
          getStudentByBatchName();
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }


  var $student_list_body = $('#student_list_body');
  $student_list_body.on('click', '.del_stud_entry', function () {
    var student_index = $(this).parents('.student_list_item_data').attr('data-stud-idx');
    // console.log(student_list[student_index])
    deleteOneStudent(student_list[student_index]);
  });

  // 删除一个学生
  function deleteOneStudent(student) {
    // console.log(student)
    if (!student) return;
    swal({
      title: '确定删除吗？',
      text: '确定删除吗？你将无法恢复它！',
      buttons: ['取消', '确定'],
      dangerMode: true
    }).then(ensure => {
      // console.log(ensure)
      if (!ensure) return;

      api.student.deleteStudent([student.sid])
        .done(function (data) {
          // console.log(data)
          if (data.status === 0) {

            swal(
              '删除成功',
              '删除学生信息成功',
              'success'
            );
            getStudentByBatchName();
          } else {
            g.fetch_err(data);
          }
        })
        .fail(g.net_err);
    });
  }


  // 编辑一个学生
  var $edit_stud_modal = $("#edit_stud_modal");
  $student_list_body.on('click', '.edit_stud_entry', function () {
    var student_index = $(this).parents('.student_list_item_data').attr('data-stud-idx');
    init_edit_stud_modal(student_list[student_index]);
    $edit_stud_modal.modal('show');
  });

  function init_edit_stud_modal(student) {
    $edit_stud_modal.find('#stu-number-edit').val(student.sid);
    $edit_stud_modal.find('#stu-name-edit').val(student.sname);
    $edit_stud_modal.find('#stu-class-edit').val(student.clazz);
    var batch_selector = $edit_stud_modal.find('#stu-batch-edit');
    var index = batch_selector.find(':contains("' + student.batch_name + '")').index();
    batch_selector[0].selectedIndex = index;
  }

  // 编辑学生确认
  $('#edit_stud_ensure').click(editOneStudent)

  // 修改一个学生的信息
  function editOneStudent() {
    var sid = $edit_stud_modal.find('#stu-number-edit').val();
    var sname = $edit_stud_modal.find('#stu-name-edit').val();
    var clazz = $edit_stud_modal.find('#stu-class-edit').val();
    var batch_name = $edit_stud_modal.find('#stu-batch-edit').val();

    if (!sid || !sname || !clazz || !batch_name) {
      swal('请完成表单填写', '', 'warning');
      return;
    }

    api.student.updateStudent(sid, sname, clazz, batch_name)
      .done(function (data) {
        if (data.status === 0) {
          swal(
            '修改成功',
            '修改学生信息成功',
            'success'
          );
          getAllBatch_StuList();
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }

  // 重置密码
  $student_list_body.on('click', '.reset_stud_entry', function () {
    var student_index = $(this).parents('.student_list_item_data').attr('data-stud-idx');
    var student = student_list[student_index]

    swal({
      title: '输入新的密码',
      content: 'input',
      buttons: ['取消', '确定'],
      dangerMode: true
    }
    ).then(function (input) {
      api.user.changePwd(student.sid, hex_md5(input))
        .done(function (data) {
          if (data.status === 0) {
            swal(
              '消息',
              data.message,
              'success'
            )
          } else {
            g.fetch_err(data)
          }
        })
        .fail(g.net_err)
    });
  });


  // 批量删除学生
  $('#delete_selected_stud').click(deleteSomeStudent);
  function deleteSomeStudent() {
    var $checked = $student_list_body.find('.batch-op').filter(':checked').parents('.student_list_item_data');
    // console.log($checked);
    var stud_ids = [];
    $checked.each(function (i, dom) {
      var index = $(dom).attr('data-stud-idx');
      stud_ids.push(student_list[index].sid);
    });
    // console.log(stud_ids);
    swal({
      title: '请确认',
      text: '确定要删除以上数据？',
      icon: 'warning',
      buttons: ['取消', '确定'],
      dangerMode: true
    }).then(function (ensure) {
      if (!ensure) return;
      api.student.deleteStudent(stud_ids)
        .done(function (data) {
          if (data.status === 0) {
            swal(
              '删除成功',
              data.message,
              'success'
            );
            getStudentByBatchName();
          } else {
            g.fetch_err(data)
          }
        })
        .fail(g.net_err);
    });
  }

});