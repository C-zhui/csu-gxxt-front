var base_url='http://134.175.152.210:8084';

$(document).ready(function () {
  init_data();
  console.log('$(document).ready');
});

// 初始化页面数据
function init_data(){
  // 初始化实习批次管理模块
  getAllSemesterName();
  // 学生列表初始化批次 + 初始化学生列表
  getAllBatch_StuList();
}

// 1、实习批次管理部分(OK)

// 查询所有学期及每个学期对应的批次---完成学期与批次的初始化工作
function getAllSemesterName(){
  $('.allBatchManage').empty();   //初始化清空
  $.ajax({
    type: 'post',
    url: base_url + '/batch/getAllSemesterName',
    data: {},
    datatype: 'json',
    // beforeSend: function(xhr) {
    //   xhr.withCredentials = true;
    // },
    // crossDomain:true,
    success: function(data){
      if(data.status === 0){
        console.log(data)
        semesters_obj = data.data;
        // console.log(semesters_obj);
        for(let i=0; i<semesters_obj.length; i++){
          if(semesters_obj[i].semester_name !== null){
            let html = '';
            // 学期名 button
            html += '<p><button class="btn btn-outline-primary" data-toggle="collapse" href="#'+semesters_obj[i].semester_name+'" type="button" aria-expanded="false" aria-controls="'+semesters_obj[i].semester_name+'">'+semesters_obj[i].semester_name+'学期</button>';

            // 添加新批次图标
            html += '<i class="btn btn-sm btn-default" onclick="add_semester_batch(this)" name="'+semesters_obj[i].semester_name+'" data-toggle="modal" data-target="#add_semester_batchModal"><img class="add-icon" src="../icon/add-sm.svg"></i>';

            // 编辑学期名图标
            html += '<i class="btn btn-sm btn-default" onclick="editSemesterName_init(this)" name="'+semesters_obj[i].semester_name+'" data-toggle="modal" data-target="#edit_semester_nameModal"><img class="edit-icon" src="../icon/edit-inner.svg"></i>';

            // 删除学期图标
            html += '<i class="btn btn-sm btn-default" onclick="delSemester(this)" name="'+semesters_obj[i].semester_name+'" data-toggle="modal" data-target="#del_semesterModal"><img class="del-icon" src="../icon/delete-x.svg"></i>';
            html += '</p>';

            // 根据学期名查询批次
            $.ajax({
              type: 'post',
              url: base_url + '/batch/getBatchBySemesterName',
              data: {'semester_name': semesters_obj[i].semester_name},
              datatype: 'json',
              beforeSend: function(xhr) {
                xhr.withCredentials = true;
              },
              crossDomain:true,
              success: function(data){
                if(data.status === 0){
                  let batchs = data.data;
                  // console.log(batchs);
                  html += '<div class="collapse" id="'+semesters_obj[i].semester_name+'"><div class="card card-body"><ul>';
                  for(let j=0; j<batchs.length; j++){
                    // 修改批次图标
                    html += '<li>'+batchs[j].batch_name+'<i class="btn btn-sm btn-default" semester_name="'+batchs[j].semester_name+'" batch_name="'+batchs[j].batch_name+'" credit="'+batchs[j].credit+'"  onclick="editOneBatch_init(this)" data-toggle="modal" data-target="#editOneBatchModal"><img class="inner-edit-icon" src="./img/edit-inner.svg"></i>';

                    // 删除批次图标
                    html += '<i class="btn btn-sm btn-default" batch_name="'+batchs[j].batch_name+'" onclick="delOneBatch(this)"><img class="inner-del-icon" src="./img/delete.svg"></i></li>';
                  }
                  html += '</ul></div></div>';
                  // console.log(html);
                  $('.allBatchManage').append(html);
                }
              }
            });
          }
        }
        // $('.allBatchManage').html(html);
      }
    }
  });
}

// 添加新学期  或  添加新批次
function addNewSemester(){
  let new_semester = $('#new_semester').val();
  let new_semester_batch = $('#new_semester_batch').val();
  let new_semester_credit = $('#new_semester_credit').val();
  console.log(new_semester);
  $.ajax({
    type: 'post',
    url: base_url + '/batch/addBatch',
    datatype: 'json',
    data: {
      'batch_name': new_semester_batch,
      'credit': new_semester_credit,
      'semester_name': new_semester
    },
    success: function(data){
      if(data.status === 0){
        console.log(data);
        swal(
          '添加成功',
          '添加新学期成功',
          'success'
        );
        init_data();
      }
    }
  });
}

// 修改学期名初始化
function editSemesterName_init(obj){
  let semester_name = obj.getAttribute('name');
  // console.log(semester_name);
  $('#editSemesterName_old').val(semester_name);
}
// 修改学期名
function editSemesterName(){
  let old_semester_name = $('#editSemesterName_old').val();
  let new_semester_name = $('#editSemesterName_new').val();
  // console.log(semester);
  $.ajax({
    type: 'post',
    url: base_url + '/batch/updateSemesterName',
    datatype: 'json',
    data: {
      'old': old_semester_name,
      'semesterName': new_semester_name
    },
    success: function(data){
      if(data.status === 0){
        // console.log(data);
        swal(
          '修改成功',
          '修改学期名成功，你的新学期名为：'+new_semester_name,
          'success'
        );
        init_data();
      }
    }
  });
}

// 删除某个学期
function delSemester(obj){
  let semester_name = obj.getAttribute('name');
  swal({
	  title: '确定删除吗？',
	  text: '确定删除"' + semester_name + '学期"吗？你将无法恢复它！',
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
        url: base_url + '/batch/deleteSemester',
        datatype: 'json',
        data: {
          'semesterName': semester_name
        },
        success: function(data){
          if(data.status === 0){
            // console.log(data);
            swal(
        			'删除！',
        			'"' + semester_name + '学期"已经被删除。',
        			'success'
      			);
            // 刷新实习批次信息
            init_data();
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

// 添加新批次初始化
function add_semester_batch(obj){
  let semester_name = obj.getAttribute('name');
  // console.log(semester_name);
  $('#addNewBatch_semester').val(semester_name);
}
// 添加新批次
function addNewBatch(){
  let semester = $('#addNewBatch_semester').val();
  let new_semester_batch = $('#addNewBatch_batch').val();
  let new_semester_credit = $('#addNewBatch_credit').val();
  // console.log(semester);
  $.ajax({
    type: 'post',
    url: base_url + '/batch/addBatch',
    datatype: 'json',
    data: {
      'batch_name': new_semester_batch,
      'credit': new_semester_credit,
      'semester_name': semester
    },
    success: function(data){
      if(data.status === 0){
        // console.log(data);
        swal(
          '添加成功',
          '添加新批次成功',
          'success'
        );
        init_data();
      }
    }
  });
}

// 编辑某个批次--初始化
function editOneBatch_init(obj){
  let semester_name = obj.getAttribute('semester_name');
  let batch_name = obj.getAttribute('batch_name');
  let credit = obj.getAttribute('credit');
  let bat_describe = obj.getAttribute('bat_describe');
  // console.log(batch_name);
  $('#editOneBatchSemesterName').val(semester_name);
  $('#editOneBatchName').val(batch_name);
  $('#editOneBatchCredit').val(credit);
}
// 编辑某个批次
function editOneBatch(){
  let semester_name = $('#editOneBatchSemesterName').val();
  let batch_name = $('#editOneBatchName').val();
  let credit = $('#editOneBatchCredit').val();
  let bat_describe = "";
  $.ajax({
    type: 'post',
    url: base_url + '/batch/updateBatch',
    datatype: 'json',
    data: {
      'semester_name': semester_name,
      'batch_name': batch_name,
      'credit': credit,
      'bat_describe': bat_describe
    },
    success: function(data){
      if(data.status === 0){
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

// 删除某个批次
function delOneBatch(obj){
  let batch_name = obj.getAttribute('batch_name');
  swal({
	  title: '确定删除吗？',
	  text: '确定删除"' + batch_name + '批次"吗？你将无法恢复它！',
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
        url: base_url + '/batch/deleteBatch/' + batch_name,
        datatype: 'json',
        data: {},
        success: function(data){
          if(data.status === 0){
            // console.log(data);
            swal(
        			'删除！',
        			'"' + batch_name + '批次"已经被删除。',
        			'success'
      			);
            // 刷新实习批次信息
            init_data();
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
function importStudents(){
  // console.log($("#uploadfiles").val());
  var formdata = new FormData();
  formdata.append("file",  $("#uploadfiles")[0].files[0]);
  let batchName = $('#importStudents_select').val();
  formdata.append("batchName", batchName);
  console.log(formdata.getAll("file"));
  console.log(formdata.getAll("batchName"));
  $.ajax({
      url: base_url + "/admin/importStudents",
      type: "post",
      data: formdata,
      cache : false,
      processData: false,
      contentType: false,
      success:function(data){
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
      error:function(e){
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
function getAllBatch_StuList(){
  $.ajax({
    type: 'post',
    url: base_url + '/batch/getAllBatch',
    datatype: 'json',
    data: {},
    beforeSend: function(xhr) {
      xhr.withCredentials = true;
    },
    crossDomain:true,
    success: function(data){
      if(data.status === 0){
        console.log(data);
        html = "";
        for(let i=0; i<data.data.length; i++){
          html += '<option>'+data.data[i].batch_name+'</option>';
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
function getStudentByBatchName(){
  let batch_name = $('#stu_list_batch_name').val();
  let stu_list_tbody = document.getElementById('adminTbody');
  // console.log(batch_name);
  $.ajax({
    type: 'post',
    url: base_url + '/student/getStudentByBatchName',
    datatype: 'json',
    data: {
      'batchName': batch_name
    },
    success: function(data){
      if(data.status === 0){
        data_arr = data.data;
        // console.log(data_arr);
        let html = "";
        for(let i=0; i<data_arr.length; i++){
          html += '<tr>';
          // 复选框
          html += '<td><input type="checkbox" name="stu_list_checkbox" class="" id='+data_arr[i].sid+'></td>';
          // 表格数据
          html += '<td>'+data_arr[i].sid+'</td><td>'+data_arr[i].sname+'</td><td>'+data_arr[i].clazz+'</td><td>'+data_arr[i].batch_name+'</td>';
          // 删除按钮
          html += '<td><input type="button" class="btn btn-danger btn-sm" value="删除" sid='+data_arr[i].sid+' onclick="deleteOneStudent(this)" />&emsp;';
          // 重置密码按钮
          html += '<input type="button" class="btn btn-primary btn-sm" value="重置密码" sid='+data_arr[i].sid+' onclick="initOneStudentPassword(this)" />&emsp;';
          // 编辑按钮
          html += '<input type="button" class="btn btn-success btn-sm" data-toggle="modal" data-target="#studentManage-button-editModal" value="编辑" sid='+data_arr[i].sid+' onclick="editOneStudent_init(this)" sname='+data_arr[i].sname+' clazz='+data_arr[i].clazz+' batch='+data_arr[i].batch_name+' /></td></tr>';
        }
        stu_list_tbody.innerHTML = html;
        // 初始化分页
        goPage(1,10);   // 当前页数为1，每页10条数据
      }
    }
  });
}

// 删除一个学生
function deleteOneStudent(obj){
  // console.log(obj);
  let sid = obj.getAttribute('sid');
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
        success: function(data){
          console.log(data);
          if(data.status === 0){
            // console.log(data);
            swal(
              '删除成功',
              '删除学生信息成功',
              'success'
            );
            getAllBatch_StuList();
          }
          else{
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
function deleteSomeStudent(){
  var id_array = new Array();
  let checked_stu_ids = $('#adminTbody input[name="stu_list_checkbox"]:checked');
  console.log(checked_stu_ids);
  checked_stu_ids.each(function(){
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
        success: function(data){
          console.log(data);
          if(data.status === 0){
            // console.log(data);
            swal(
              '删除成功',
              '删除学生信息成功',
              'success'
            );
            getAllBatch_StuList();
          }
          else{
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
function addOneStudent(){
  let sid = $('#stu-number-add').val();
  let sname = $('#stu-name-add').val();
  let clazz = $('#stu-classes-add').val();
  let batch_name = $('#addStudentSelecetBatch').val();

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
    success: function(data){
      if(data.status === 0){
        // console.log(data);
        swal(
          '添加成功',
          '添加学生信息成功',
          'success'
        );
        getAllBatch_StuList();
      }
      else{
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
function editOneStudent_init(obj){
  // console.log(obj);
  let sid = obj.getAttribute('sid');
  let sname = obj.getAttribute('sname');
  let clazz = obj.getAttribute('clazz');
  let batch = obj.getAttribute('batch');

  $('#stu-number-edit').val(sid);
  $('#stu-name-edit').val(sname);
  $('#stu-class-add').val(clazz);
  $('#stu-batch-edit').val(batch);
  // console.log(batch);
}
// 修改一个学生的信息
function editOneStudent(){
  let sid = $('#stu-number-edit').val();
  let batch_name = $('#stu-batch-edit').val();
  let sname = $('#stu-name-edit').val();
  let clazz = $('#stu-class-add').val();
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
    contentType : "application/json",              //发送至服务器的类型
    dataType : "json",
    success: function(data){
      // console.log(data);
      if(data.status === 0){
        // console.log(data);
        swal(
          '修改成功',
          '修改学生信息成功',
          'success'
        );
        getAllBatch_StuList();
      }
      else{
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
function initOneStudentPassword(obj){
  let sid = obj.getAttribute('sid');
  let spwd = hex_md5("123456");
  let senddata = JSON.stringify([{'id': sid,'pwd': spwd}]);
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
        success: function(data){
          console.log(data);
          if(data.status === 0){
            // console.log(data);
            swal(
              '重置密码成功',
              '重置密码成功，该学生的密码已经回复初始密码：123456',
              'success'
            );
            getAllBatch_StuList();
          }
          else{
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
