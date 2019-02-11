require(['jquery', 'lodash', 'swal', 'api/apiobj', 'config/global', 'api/batch', 'flatpickr'], function ($, _, swal, api, g) {
  var base_url = g.base_url

  $(document).ready(function () {
    init_data();
    // console.log('$(document).ready');
  });

  // 初始化页面数据
  function init_data() {
    // 初始化实习批次管理模块
    // getAllSemesterName();
    // 获取所有批次
    init_flatpickr()

    init_batches();
    // 学生列表初始化批次 + 初始化学生列表
    getAllBatch_StuList();
  }

  function init_flatpickr() {
    $('.date-plugin').flatpickr({
      dateFormat: 'Y-m-d'
    })
  }

  // 1、实习批次管理部分(OK)
  var batches = [];
  function init_batches() {
    api.batch.getAllBatch()
      .done(function (data) {
        if (data.status === 0) {
          batches = data.data
          var $list = $('#batch-list').empty();
          var template = $('#template-batch');
          _.each(batches, function (d, i) {
            var clone = template.clone().removeClass('d-none').attr('id', '').addClass('batch-data').attr('data-ind', i);
            clone.find('.batch-name').text(d.batch_name)
            clone.appendTo($list)
          })
        } else {
          g.fetch_err(data)
        }
      }).fail(g.net_err)
  }


  // 查询所有学期及每个学期对应的批次---完成学期与批次的初始化工作
  // function getAllSemesterName() {
  //   $('.allBatchManage').empty();   //初始化清空
  //   api.batch.getAllSemesterName()
  //     .done(function (data) {
  //       // console.log(data)
  //       if (data.status != 0) {
  //         g.fetch_err(data); return;
  //       }

  //       semesters_obj = data.data;
  //       // console.log(semesters_obj);

  //       // semesters = data.data; // todo jquery 重构，将onclick放到$.fn.click
  //       // _.each(semesters,function(val){
  //       // 
  //       // })

  //       for (var  i = 0; i < semesters_obj.length; i++) {
  //         if (semesters_obj[i].semester_name !== null) {
  //           var  html = '';
  //           // 学期名 button
  //           html += '<p><button class="btn btn-outline-primary" data-toggle="collapse" href="#' + semesters_obj[i].semester_name + '" type="button" aria-expanded="false" aria-controls="' + semesters_obj[i].semester_name + '">' + semesters_obj[i].semester_name + '学期</button>';

  //           // 添加新批次图标 onclick="add_semester_batch(this)"
  //           html += '<i class="add_semester_btn btn btn-sm btn-default"  name="' + semesters_obj[i].semester_name + '" data-toggle="modal" data-target="#add_semester_batchModal"><img class="add-icon" src="../icon/add-sm.svg"></i>';

  //           // 编辑学期名图标 onclick="editSemesterName_init(this)"
  //           html += '<i class="editSemester_btn btn btn-sm btn-default"  name="' + semesters_obj[i].semester_name + '" data-toggle="modal" data-target="#edit_semester_nameModal"><img class="edit-icon" src="../icon/edit-inner.svg"></i>';

  //           // 删除学期图标 onclick="delSemester(this)"
  //           html += '<i class="delSemester_btn btn btn-sm btn-default"  name="' + semesters_obj[i].semester_name + '" data-toggle="modal" data-target="#del_semesterModal"><img class="del-icon" src="../icon/delete-x.svg"></i>';
  //           html += '</p>';

  //           // 根据学期名查询批次
  //           api.batch.getBatchBySemesterName(semesters_obj[i].semester_name)
  //             .done(function (data) {
  //               if (data.status === 0) {
  //                 var  batchs = data.data;
  //                 // console.log(batchs);
  //                 html += '<div class="collapse" id="' + semesters_obj[i].semester_name + '"><div class="card card-body"><ul>';
  //                 for (var  j = 0; j < batchs.length; j++) {
  //                   // 修改批次图标
  //                   html += '<li>' + batchs[j].batch_name + '<i class="btn btn-sm btn-default" semester_name="' + batchs[j].semester_name + '" batch_name="' + batchs[j].batch_name + '" credit="' + batchs[j].credit + '"  onclick="editOneBatch_init(this)" data-toggle="modal" data-target="#editOneBatchModal"><img class="inner-edit-icon" src="./img/edit-inner.svg"></i>';

  //                   // 删除批次图标
  //                   html += '<i class="btn btn-sm btn-default" batch_name="' + batchs[j].batch_name + '" onclick="delOneBatch(this)"><img class="inner-del-icon" src="./img/delete.svg"></i></li>';
  //                 }
  //                 html += '</ul></div></div>';
  //                 $('.allBatchManage').append(html);
  //               }
  //             }).fail(g.net_err);
  //         }
  //       }
  //     }).fail(g.net_err)
  // }

  // 添加新批次
  $('#add-new-batch').click(addNewSemester);
  function addNewSemester() {
    var new_semester = $('#addNewBatch_semester').val();
    var new_semester_batch = $('#addNewBatch_batch').val();
    var new_semester_credit = $('#addNewBatch_credit').val();
    var new_semester_beginDate = $('#addNewBatch_beginDate').val();
    if (!new_semester || !new_semester_batch || !new_semester_credit || !new_semester_beginDate) {
      swal('请完成表单填写', '', 'warning')
      return;
    }
    // console.log(new_semester);

    api.batch.addBatch(new_semester_batch, new_semester_credit, new_semester, new_semester_beginDate)
      .done(function (data) {
        if (data.status === 0) {
          console.log(data);
          swal(
            '添加成功',
            '添加新批次成功',
            'success'
          );
          init_batches();
        } else {
          g.fetch_err(data);
        }
      })
  }



  // // 修改学期名初始化
  // function editSemesterName_init(obj) {
  //   var  semester_name = obj.getAttribute('name');
  //   // console.log(semester_name);
  //   $('#editSemesterName_old').val(semester_name);
  // }
  // // 修改学期名
  // function editSemesterName() {
  //   var  old_semester_name = $('#editSemesterName_old').val();
  //   var  new_semester_name = $('#editSemesterName_new').val();
  //   // console.log(semester);
  //   $.ajax({
  //     type: 'post',
  //     url: base_url + '/batch/updateSemesterName',
  //     datatype: 'json',
  //     data: {
  //       'old': old_semester_name,
  //       'semesterName': new_semester_name
  //     },
  //     success: function (data) {
  //       if (data.status === 0) {
  //         // console.log(data);
  //         swal(
  //           '修改成功',
  //           '修改学期名成功，你的新学期名为：' + new_semester_name,
  //           'success'
  //         );
  //         init_data();
  //       }
  //     }
  //   });
  // }

  // // 删除某个学期
  // function delSemester(obj) {
  //   var  semester_name = obj.getAttribute('name');
  //   swal({
  //     title: '确定删除吗？',
  //     text: '确定删除"' + semester_name + '学期"吗？你将无法恢复它！',
  //     type: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#d33',
  //     cancelButtonColor: '#3085d6',
  //     confirmButtonText: '确定删除！',
  //     cancelButtonText: '取消',
  //   }).then(result => {
  //     if (result.value) {
  //       $.ajax({
  //         type: 'post',
  //         url: base_url + '/batch/deleteSemester',
  //         datatype: 'json',
  //         data: {
  //           'semesterName': semester_name
  //         },
  //         success: function (data) {
  //           if (data.status === 0) {
  //             // console.log(data);
  //             swal(
  //               '删除！',
  //               '"' + semester_name + '学期"已经被删除。',
  //               'success'
  //             );
  //             // 刷新实习批次信息
  //             init_data();
  //           }
  //         }
  //       });
  //       console.log(result.value)
  //     } else {
  //       // handle dismiss, result.dismiss can be 'cancel', 'overlay', 'close', and 'timer'
  //       console.log(result.dismiss)
  //     }
  //   })
  // }

  // // 添加新批次初始化
  // function add_semester_batch(obj) {
  //   var  semester_name = obj.getAttribute('name');
  //   // console.log(semester_name);
  //   $('#addNewBatch_semester').val(semester_name);
  // }
  // // 添加新批次
  // function addNewBatch() {
  //   var  semester = $('#addNewBatch_semester').val();
  //   var  new_semester_batch = $('#addNewBatch_batch').val();
  //   var  new_semester_credit = $('#addNewBatch_credit').val();
  //   // console.log(semester);
  //   $.ajax({
  //     type: 'post',
  //     url: base_url + '/batch/addBatch',
  //     datatype: 'json',
  //     data: {
  //       'batch_name': new_semester_batch,
  //       'credit': new_semester_credit,
  //       'semester_name': semester
  //     },
  //     success: function (data) {
  //       if (data.status === 0) {
  //         // console.log(data);
  //         swal(
  //           '添加成功',
  //           '添加新批次成功',
  //           'success'
  //         );
  //         init_data();
  //       }
  //     }
  //   });
  // }

  // 编辑批次信息
  $('#batch-list').on('click', '.edit-btn', function () {
    var data_index = $(this).parents('.batch-data').attr('data-ind');
    data_index = parseInt(data_index);

    var batch = batches[data_index];
    editOneBatch_init(batch)
    $('#editOneBatchModal').modal('show')
  });

  // 编辑某个批次--初始化
  function editOneBatch_init(batch) {
    console.log(batch)
    // console.log(batch_name);
    $('#editOneBatchSemesterName').val(batch.semester_name);
    $('#editOneBatchName').val(batch.batch_name);
    $('#editOneBatchCredit').val(batch.credit);
    $('#editOneBatchBeginDate').val(batch.beginDate);
  }

  $('#editOneBatchCommit').click(editOneBatch);
  console.log("$('#editOneBatchCommit').click")
  // 编辑某个批次
  function editOneBatch() {
    var semester_name = $('#editOneBatchSemesterName').val();
    var batch_name = $('#editOneBatchName').val();
    var credit = $('#editOneBatchCredit').val();
    var beginDate = $('#editOneBatchBeginDate').val();
    if (!semester_name || !batch_name || !credit || !beginDate) {
      swal('请完成表单填写', '', 'warning')
      return;
    }
    $.ajax({
      type: 'post',
      url: base_url + '/batch/updateBatch',
      datatype: 'json',
      data: {
        'semester_name': semester_name,
        'batch_name': batch_name,
        'credit': credit,
        'beginDate':beginDate
      },
      success: function (data) {
        if (data.status === 0) {
          // console.log(data);
          swal(
            '修改成功',
            '修改批次信息成功',
            'success'
          );
          init_data();
        }
      }
    });
  }

  $('#batch-list').on('click', '.delete-btn', function () {
    var data_index = $(this).parents('.batch-data').attr('data-ind')
    data_index = parseInt(data_index)
    // console.log(data_index,batches[data_index])

    delOneBatch(batches[data_index])
  })

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
          }else {
            g.fetch_err(data)
          }
        }).fail(g.net_err)
    })
  }


  // 2、学生信息导入部分【有问题！！！】

  // 下载标准模版【有问题！！！】
  // function downloadTemplate(){
  //   $.ajax({
  //     type: 'get',
  //     url: base_url + '/admin/download',
  //     // datatype: 'json',
  //     // data: {},
  //     success: function(result){
  //       // 创建a标签，设置属性，并触发点击下载
  //       var $a = $("<a>");
  //       $a.attr("href", result.data.file);
  //       $a.attr("download", result.data.filename);
  //       $("body").append($a);
  //       $a[0].click();
  //       $a.remove();
  //     }
  //   });
  // }

  // 上传文件导入学生信息
  function importStudents() {
    // console.log($("#uploadfiles").val());
    var formdata = new FormData();
    formdata.append("file", $("#uploadfiles")[0].files[0]);
    var batchName = $('#importStudents_select').val();
    formdata.append("batchName", batchName);
    console.log(formdata.getAll("file"));
    console.log(formdata.getAll("batchName"));
    $.ajax({
      url: base_url + "/admin/importStudents",
      type: "post",
      data: formdata,
      cache: false,
      processData: false,
      contentType: false,
      success: function (data) {
        // window.clearInterval(timer);
        console.log("over..");
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
    $.ajax({
      type: 'post',
      url: base_url + '/batch/getAllBatch',
      datatype: 'json',
      data: {},
      beforeSend: function (xhr) {
        xhr.withCredentials = true;
      },
      crossDomain: true,
      success: function (data) {
        if (data.status === 0) {
          // console.log(data);
          html = "";
          for (var i = 0; i < data.data.length; i++) {
            html += '<option>' + data.data[i].batch_name + '</option>';
          }
          // console.log(html);
          $('#stu_list_batch_name').html(html);
          $('#addStudentSelecetBatch').html(html);
          $('#stu-batch-edit').html(html);
          $('#importStudents_select').html(html);
          // 根据批次名获取学生列表
          getStudentByBatchName();
        }
      }
    });
  }

  // 根据批次名获取学生列表
  function getStudentByBatchName() {
    var batch_name = $('#stu_list_batch_name').val();
    var stu_list_tbody = document.getElementById('adminTbody');
    // console.log(batch_name);
    $.ajax({
      type: 'post',
      url: base_url + '/student/getStudentByBatchName',
      datatype: 'json',
      data: {
        'batchName': batch_name
      },
      success: function (data) {
        if (data.status === 0) {
          data_arr = data.data;
          // console.log(data_arr);
          var html = "";
          for (var i = 0; i < data_arr.length; i++) {
            html += '<tr>';
            // 复选框
            html += '<td><input type="checkbox" name="stu_list_checkbox" class="" id=' + data_arr[i].sid + '></td>';
            // 表格数据
            html += '<td>' + data_arr[i].sid + '</td><td>' + data_arr[i].sname + '</td><td>' + data_arr[i].clazz + '</td><td>' + data_arr[i].batch_name + '</td>';
            // 删除按钮
            html += '<td><input type="button" class="btn btn-danger btn-sm" value="删除" sid=' + data_arr[i].sid + ' onclick="deleteOneStudent(this)" />&emsp;';
            // 重置密码按钮
            html += '<input type="button" class="btn btn-primary btn-sm" value="重置密码" sid=' + data_arr[i].sid + ' onclick="initOneStudentPassword(this)" />&emsp;';
            // 编辑按钮
            html += '<input type="button" class="btn btn-success btn-sm" data-toggle="modal" data-target="#studentManage-button-editModal" value="编辑" sid=' + data_arr[i].sid + ' onclick="editOneStudent_init(this)" sname=' + data_arr[i].sname + ' clazz=' + data_arr[i].clazz + ' batch=' + data_arr[i].batch_name + ' /></td></tr>';
          }
          stu_list_tbody.innerHTML = html;
          // 初始化分页
          goPage(1, 10);   // 当前页数为1，每页10条数据
        }
      }
    });
  }

  // 删除一个学生
  function deleteOneStudent(obj) {
    // console.log(obj);
    var sid = obj.getAttribute('sid');
    var sid_arr = new Array();
    sid_arr.push(sid);
    var sid_arr = JSON.stringify(sid_arr);
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
        $.ajax({
          type: 'post',
          url: base_url + '/student/deleteStudent',
          datatype: 'json',
          contentType: "application/json",
          data: sid_arr,
          success: function (data) {
            console.log(data);
            if (data.status === 0) {
              // console.log(data);
              swal(
                '删除成功',
                '删除学生信息成功',
                'success'
              );
              getAllBatch_StuList();
            }
            else {
              swal(
                '删除失败',
                '删除学生信息失败，请重试！',
                'error'
              );
            }
          }
        });
        console.log(result.value)
      } else {
        // handle dismiss, result.dismiss can be 'cancel', 'overlay', 'close', and 'timer'
        console.log(result.dismiss)
      }
    })
  }

  // 批量删除学生
  function deleteSomeStudent() {
    var id_array = new Array();
    var checked_stu_ids = $('#adminTbody input[name="stu_list_checkbox"]:checked');
    console.log(checked_stu_ids);
    checked_stu_ids.each(function () {
      id_array.push($(this)[0].id);
    })
    console.log(id_array);
    var sid_arr = JSON.stringify(id_array);
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
        $.ajax({
          type: 'post',
          url: base_url + '/student/deleteStudent',
          datatype: 'json',
          contentType: "application/json",
          data: sid_arr,
          success: function (data) {
            console.log(data);
            if (data.status === 0) {
              // console.log(data);
              swal(
                '删除成功',
                '删除学生信息成功',
                'success'
              );
              getAllBatch_StuList();
            }
            else {
              swal(
                '删除失败',
                '删除学生信息失败，请重试！',
                'error'
              );
            }
          }
        });
        console.log(result.value)
      } else {
        // handle dismiss, result.dismiss can be 'cancel', 'overlay', 'close', and 'timer'
        console.log(result.dismiss)
      }
    })
  }

  // 添加一个学生
  function addOneStudent() {
    var sid = $('#stu-number-add').val();
    var sname = $('#stu-name-add').val();
    var clazz = $('#stu-classes-add').val();
    var batch_name = $('#addStudentSelecetBatch').val();

    $.ajax({
      type: 'post',
      url: base_url + '/student/addStudent',
      datatype: 'json',
      data: {
        'sid': sid,
        'sname': sname,
        'clazz': clazz,
        'batch_name': batch_name
      },
      success: function (data) {
        if (data.status === 0) {
          // console.log(data);
          swal(
            '添加成功',
            '添加学生信息成功',
            'success'
          );
          getAllBatch_StuList();
        }
        else {
          swal(
            '添加失败',
            '添加学生信息失败，请重试！',
            'error'
          );
        }
      }
    });
  }

  // 修改一个学生--初始化
  function editOneStudent_init(obj) {
    // console.log(obj);
    var sid = obj.getAttribute('sid');
    var sname = obj.getAttribute('sname');
    var clazz = obj.getAttribute('clazz');
    var batch = obj.getAttribute('batch');

    $('#stu-number-edit').val(sid);
    $('#stu-name-edit').val(sname);
    $('#stu-class-add').val(clazz);
    $('#stu-batch-edit').val(batch);
    // console.log(batch);
  }
  // 修改一个学生的信息
  function editOneStudent() {
    var sid = $('#stu-number-edit').val();
    var batch_name = $('#stu-batch-edit').val();
    var sname = $('#stu-name-edit').val();
    var clazz = $('#stu-class-add').val();
    // console.log(sid);
    // var data = {'sid': sid, 'batch_name': batch_name, 'sname': sname, 'clazz': clazz};
    $.ajax({
      type: 'post',
      url: base_url + '/student/updateStudent',
      data: JSON.stringify({
        'sid': sid,
        'batch_name': batch_name,
        'sname': sname,
        'clazz': clazz
      }),
      contentType: "application/json",              //发送至服务器的类型
      dataType: "json",
      success: function (data) {
        // console.log(data);
        if (data.status === 0) {
          // console.log(data);
          swal(
            '修改成功',
            '修改学生信息成功',
            'success'
          );
          getAllBatch_StuList();
        }
        else {
          swal(
            '修改失败',
            '修改学生信息失败，请重试！',
            'error'
          );
        }
      }
    });
  }

  // 重置一个学生的密码【等接口】
  function initOneStudentPassword(obj) {
    var sid = obj.getAttribute('sid');
    var spwd = hex_md5("123456");
    var senddata = JSON.stringify([{ 'id': sid, 'pwd': spwd }]);
    swal({
      title: '确定重置密码吗？',
      text: '确定重置该学生的密码吗？你将无法撤回此操作！',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: '确定重置！',
      cancelButtonText: '取消',
    }).then(result => {
      if (result.value) {
        $.ajax({
          type: 'post',
          url: base_url + '/user/changePwd',
          datatype: 'json',
          contentType: "application/json",
          data: senddata,
          success: function (data) {
            console.log(data);
            if (data.status === 0) {
              // console.log(data);
              swal(
                '重置密码成功',
                '重置密码成功，该学生的密码已经回复初始密码：123456',
                'success'
              );
              getAllBatch_StuList();
            }
            else {
              swal(
                '重置密码失败',
                '重置密码失败，请重试！',
                'error'
              );
            }
          }
        });
        console.log(result.value)
      } else {
        // handle dismiss, result.dismiss can be 'cancel', 'overlay', 'close', and 'timer'
        console.log(result.dismiss)
      }
    })
  }

});
