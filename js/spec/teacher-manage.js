$(document).ready(function () {
  init_data();
})

console.log('init teacher-manage.js')
var base_url = 'http://134.175.152.210:8084';
var X1 = "选择教师组";

// 初始化页面数据
function init_data(){
  // 初始化教师组管理模块
  getAllTeacherGroup();
  // 教师列表初始化批次 + 初始化教师列表
  getAllGroup_StuList();
}

// 1、教师组管理部分

// 查询所有教师组及每个教师组对应的工序---完成教师组与工序的初始化工作
function getAllTeacherGroup(){
  $('.allTeacherGroupManage').empty();   //初始化清空
  $.ajax({
    type: 'post',
    url: base_url + '/group/getAllGroup',
    data: {},
    datatype: 'json',
    success: function(data){
      if(data.status === 0){
        teacher_group_obj = data.data;
        // console.log(teacher_group_obj);
        for(let i=0; i<teacher_group_obj.length; i++){
          let html = '';
          // 教师组名 button
          html += '<p><button class="btn btn-outline-primary" data-toggle="collapse" href="#'+teacher_group_obj[i].t_group_id+'" type="button" aria-expanded="false" aria-controls="'+teacher_group_obj[i].t_group_id+'">'+teacher_group_obj[i].t_group_id+'</button>';

          // 添加新工序图标
          html += '<i class="btn btn-sm btn-default" onclick="addTeacherGroupProcess_init(this)" name="'+teacher_group_obj[i].t_group_id+'" data-toggle="modal" data-target="#add_teacher_group_processModal"><img class="add-icon" src="./img/add.svg"></i>';

          // 编辑教师组图标
          html += '<i class="btn btn-sm btn-default" onclick="editTeacherGroup_init(this)" name="'+teacher_group_obj[i].t_group_id+'" data-toggle="modal" data-target="#editTeacherGroupModal"><img class="edit-icon" src="./img/edit.svg"></i>';

          // 删除教师组图标
          html += '<i class="btn btn-sm btn-default" onclick="delTeacherGroup(this)" name="'+teacher_group_obj[i].t_group_id+'"><img class="del-icon" src="./img/delete-x.svg"></i>';
          html += '</p>';

          // 根据教师组名查询工序
          $.ajax({
            type: 'post',
            url: base_url + '/group/getProcedByGroup',
            data: {'groupName': teacher_group_obj[i].t_group_id},
            datatype: 'json',
            success: function(data){
              if(data.status === 0){
                let process = data.data;
                // console.log(batchs);
                html += '<div class="collapse" id="'+teacher_group_obj[i].t_group_id+'"><div class="card card-body"><ul>';
                for(let j=0; j<process.length; j++){
                  // 修改工序图标
                  html += '<li>'+process[j]+'<i class="btn btn-sm btn-default" teacher_group_name="'+teacher_group_obj[i].t_group_id+'" process_name="'+process[j]+'"   onclick="editOneProcess_init(this)" data-toggle="modal" data-target="#editOneProcessModal"><img class="inner-edit-icon" src="./img/edit-inner.svg"></i>';

                  // 删除工序图标
                  html += '<i class="btn btn-sm btn-default" teacher_group_name="'+teacher_group_obj[i].t_group_id+'" process_name="'+process[j]+'" onclick="delOneProcess(this)"><img class="inner-del-icon" src="./img/delete.svg"></i></li>';
                }
                html += '</ul></div></div>';
                // console.log(html);
                $('.allTeacherGroupManage').append(html);
              }
            }
          });
        }
        // $('.allTeacherGroupManage').html(html);
      }
    }
  });
}

// 添加新教师组
function addNewTeacherGroup(){
  let new_teacher_group_name = $('#new_semester').val();
  // console.log(new_semester);
  $.ajax({
    type: 'post',
    url: base_url + '/group/addGroup',
    datatype: 'json',
    contentType: "application/json",
    data: JSON.stringify({
      't_group_id': new_teacher_group_name
    }),
    success: function(data){
      if(data.status === 0){
        // console.log(data);
        swal(
          '添加成功',
          '添加新教师组成功',
          'success'
        );
        init_data();
      }
    }
  });
}

// 修改教师组初始化
function editTeacherGroup_init(obj){
  let teacher_group_name = obj.getAttribute('name');
  // console.log(semester_name);
  $('#editTeacherGroupName_old').val(teacher_group_name);
}
// 修改教师组
function editTeacherGroupName(){
  let old_teacher_group_name = $('#editTeacherGroupName_old').val();
  let new_teacher_group_name = $('#editTeacherGroupName_new').val();
  // console.log(semester);
  $.ajax({
    type: 'post',
    url: base_url + '/group/updateGroup',
    datatype: 'json',
    data: {
      'old': old_teacher_group_name,
      'newName': new_teacher_group_name
    },
    success: function(data){
      if(data.status === 0){
        // console.log(data);
        swal(
          '修改成功',
          '修改教师组名成功，你的新教师组名为：'+new_teacher_group_name,
          'success'
        );
        init_data();
      }
    }
  });
}

// 删除某个教师组
function delTeacherGroup(obj){
  let teacher_group_name = obj.getAttribute('name');
  swal({
	  title: '确定删除吗？',
	  text: '确定删除教师组"' + teacher_group_name + '"吗？你将无法恢复它！',
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
        url: base_url + '/group/delete',
        datatype: 'json',
        data: {
          'groupName': teacher_group_name
        },
        success: function(data){
          if(data.status === 0){
            // console.log(data);
            swal(
        			'删除！',
        			'教师组"' + teacher_group_name + '"已经被删除。',
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

// 添加新工序初始化
function addTeacherGroupProcess_init(obj){
  let teacher_group_name = obj.getAttribute('name');
  // console.log(semester_name);
  $('#addProcedToGroup_TeacherGroup').val(teacher_group_name);
}
// 添加新工序
function addNewProcedToGroup(){
  let groupName = $('#addProcedToGroup_TeacherGroup').val();
  let proName = $('#addProcedToGroup_Process').val();
  console.log(proName);
  $.ajax({
    type: 'post',
    url: base_url + '/proced/addProcedToGroup',
    datatype: 'json',
    data: {
      'groupName': groupName,
      'proName': proName
    },
    success: function(data){
      if(data.status === 0){
        console.log(data);
        swal(
          '添加成功',
          '添加新工序成功',
          'success'
        );
        init_data();
      }
    }
  });
}

// 编辑某个工序--初始化
function editOneProcess_init(obj){
  let teacherGroupName = obj.getAttribute('teacher_group_name');
  let processName = obj.getAttribute('process_name');
  // console.log(processName);
  $('#editOneProcessOldName').val(processName);
  $('#editOneProcessTeacherGroupName').val(teacherGroupName);
}
// 编辑某个工序名
function editOneProcess(){
  let teacherGroupName = $('#editOneProcessTeacherGroupName').val();
  let new_processName = $('#editOneProcessName').val();
  let old_processName = $('#editOneProcessOldName').val();
  $.ajax({
    type: 'post',
    url: base_url + '/proced/updateProcedFromGroup',
    datatype: 'json',
    data: {
      'groupName': teacherGroupName,
      'newName': new_processName,
      'old': old_processName
    },
    success: function(data){
      if(data.status === 0){
        // console.log(data);
        swal(
          '修改成功',
          '修改工序名成功',
          'success'
        );
        init_data();
      }
    }
  });
}

// 删除某个工序
function delOneProcess(obj){
  let process_name = obj.getAttribute('process_name');
  let teacher_group_name = obj.getAttribute('teacher_group_name');
  swal({
	  title: '确定删除吗？',
	  text: '确定删除工序"' + process_name + '"吗？你将无法恢复它！',
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
        url: base_url + '/proced/deleteProcedFromGroup',
        datatype: 'json',
        data: {
          'groupName': teacher_group_name,
          'pro_name': process_name
        },
        success: function(data){
          if(data.status === 0){
            // console.log(data);
            swal(
        			'删除！',
        			'工序"' + process_name + '"已经被删除。',
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



// 2、教师列表部分

// 获取所有教师组、教师角色 + 根据批次名获取学生列表
function getAllGroup_StuList(){
  $.ajax({
    type: 'post',
    url: base_url + '/group/getAllGroup',
    datatype: 'json',
    data: {},
    success: function(data){
      if(data.status === 0){
        // console.log(data);
        html = "<option>"+X1+"</option>";
        for(let i=0; i<data.data.length; i++){
          html += '<option>'+data.data[i].t_group_id+'</option>';
        }
        // console.log(html);
        $('#teacher_list_teacher_groups').html(html);
        $('#add_modal_teacher_group').html(html);
        $('#teachGroupFormControlSelect').html(html);
        // $('#teach-group-add').html(html);
        // 根据条件获取教师列表
        findTeachers();
      }
    }
  });
}

// 根据教师组、角色、物料权限、加班权限获取教师列表
function findTeachers(){
  let teacher_list_teacher_groups = $('#teacher_list_teacher_groups').val();
  let teacher_list_role = $('#teacher_list_role').val();
  let teacher_list_material_privilege = $('#teacher_list_material_privilege').val();
  let teacher_list_overwork_privilege = $('#teacher_list_overwork_privilege').val();

  //如果未选择教师组，设置为all
  if(teacher_list_teacher_groups === X1){
    teacher_list_teacher_groups = "all";
  }
  //如果未选择角色，设置为all
  if(teacher_list_role === "选择角色"){
    teacher_list_role = "all";
  }
  //如果未选择物料权限，设置为无
  if(teacher_list_material_privilege === "物料权限"){
    teacher_list_material_privilege = "all";
  }
  //如果未选择加班权限，设置为无
  if(teacher_list_overwork_privilege === "开放权限"){
    teacher_list_overwork_privilege = "all";
  }

  $.ajax({
    type: 'post',
    url: base_url + '/admin/findTeachers',
    datatype: 'json',
    data: {
      'tClass': teacher_list_teacher_groups,
      'role': teacher_list_role,
      'material_privilege': teacher_list_material_privilege,
      'overwork_privilege': teacher_list_overwork_privilege
    },
    success: function(data){
      if(data.status === 0){
        data_arr = data.data;
        // console.log(data);
        let html = "";
        for(let i=0; i<data_arr.length; i++){
          html += '<tr>';
          // 复选框
          html += '<td><input type="checkbox" name="teach_list_checkbox" id='+data_arr[i].tid+'></td>';
          html += '<td>'+data_arr[i].tid+'</td><td>'+data_arr[i].tname+'</td><td>'+data_arr[i].all_group+'</td><td>'+data_arr[i].role+'</td>';
          // 判断物料权限
          if(data_arr[i].material_privilege === 0){
            html += '<td>无</td>';
          }
          else if(data_arr[i].material_privilege === 1){
            html += '<td>物料登记</td>';
          }
          else if(data_arr[i].material_privilege === 2){
            html += '<td>物料申购</td>';
          }
          else {
            html += '<td> </td>';
          }

          // 判断加班权限
          if(data_arr[i].overtime_privilege === 0){
            html += '<td>无</td>';
          }
          else if(data_arr[i].overtime_privilege === 1){
            html += '<td>开放管理</td>';
          }
          else {
            html += '<td> </td>';
          }

          // 删除按钮
          html += '<td><input type="button" class="btn btn-danger btn-sm" value="删除" tid='+data_arr[i].tid+' onclick="deleteOneTeacher(this)" />&emsp;';
          // 重置密码按钮
          html += '<input type="button" class="btn btn-primary btn-sm" value="重置密码" tid='+data_arr[i].tid+' onclick="initOneTeacherPassword(this)" />&emsp;';
          // 编辑按钮
          html += '<input type="button" class="btn btn-success btn-sm" data-toggle="modal" data-target="#teacherManage-button-editModal" value="编辑" tid='+data_arr[i].tid+' onclick="editOneTeacher_init(this)" tname='+data_arr[i].tname+' all_group='+data_arr[i].all_group+' role='+data_arr[i].role+' material_privilege='+data_arr[i].material_privilege+' overtime_privilege='+data_arr[i].overtime_privilege+' /></td></tr>';
        }
        $('#adminTbody').html(html);
        // 初始化分页
        goPage(1,10);   // 当前页数为1，每页10条数据
      }
    }
  });
}

// 添加一个教师
function addOneTeacher(){
  let tid = $('#teach-nickname-add').val();
  let tname = $('#teach-name-add').val();
  let t_group_id = $('#add_modal_teacher_group').val();
  let role = $('#teach-role-add').val();
  let material_privilege = $('#teach-material_privilege-add').val();
  let overtime_privilege = $('#teach-overtime_privilege-add').val();

  // 判断物料权限
  if(material_privilege === "无"){
    material_privilege = 0;
  }
  else if(material_privilege === "物料登记"){
    material_privilege = 1;
  }
  else if(material_privilege === "物料申购"){
    material_privilege = 2;
  }

  // 判断加班权限
  if(overtime_privilege === "无"){
    overtime_privilege = 0;
  }
  else if(overtime_privilege === "开放管理"){
    overtime_privilege = 1;
  }

  $.ajax({
    type: 'post',
    url: base_url + '/teacher/addTeacher',
    datatype: 'json',
    data: {
      'tid': tid,
      'tname': tname,
      't_group_id': t_group_id,
      'role': role,
      'material_privilege': material_privilege,
      'overtime_privilege': overtime_privilege
    },
    success: function(data){
      console.log(data);
      if(data.status === 0){
        console.log(data);
        swal(
          '添加成功',
          '添加教师信息成功',
          'success'
        );
        findTeachers();
      }
      else{
        swal(
          '添加失败',
          '添加教师信息失败，请重试！',
          'error'
        );
      }
    }
  });
}

// 删除一个教师
function deleteOneTeacher(obj){
  // console.log(obj);
  let tid = obj.getAttribute('tid');
  var id_arr = new Array();
  id_arr.push(tid);
  var tid_arr = JSON.stringify(id_arr);

  // tid = obj.getAttribute('tid');
  console.log(tid);
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
        url: base_url + '/teacher/deleteTeacher',
        datatype: 'json',
        contentType: "application/json",
        data: tid_arr,
        success: function(data){
          console.log(data);
          if(data.status === 0){
            // console.log(data);
            swal(
              '删除成功',
              '删除教师信息成功',
              'success'
            );
            getAllGroup_StuList();
          }
          else{
            swal(
              '删除失败',
              '删除教师信息失败，请重试！',
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

// 批量删除教师
function deleteSomeTeachers(){
  var id_array = new Array();
  let checked_teacher_ids = $('#adminTbody input[name="teach_list_checkbox"]:checked');
  console.log(checked_teacher_ids);
  checked_teacher_ids.each(function(){
    id_array.push($(this)[0].id);
  })
  console.log(id_array);
  var tid_arr = JSON.stringify(id_array);
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
        url: base_url + '/teacher/deleteTeacher',
        datatype: 'json',
        contentType: "application/json",
        data: tid_arr,
        success: function(data){
          console.log(data);
          if(data.status === 0){
            // console.log(data);
            swal(
              '删除成功',
              '删除教师信息成功',
              'success'
            );
            getAllGroup_StuList();
          }
          else{
            swal(
              '删除失败',
              '删除教师信息失败，请重试！',
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

// 修改一个教师--初始化
function editOneTeacher_init(obj){
  // console.log(obj);
  let tid = obj.getAttribute('tid');
  let tname = obj.getAttribute('tname');
  let role = obj.getAttribute('role');
  let material_privilege = obj.getAttribute('material_privilege');
  let overtime_privilege = obj.getAttribute('overtime_privilege');
  // let all_group = obj.getAttribute('all_group');

  $('#teach_nickname_add').val(tid);
  $('#teach_name_add').val(tname);
  // $('#teach_groups_add').val(all_group);
  $('#teach_role_add').val(role);
  // 判断物料权限
  if(material_privilege === "0"){
    $('#teach_material_privilege_add').val("无");
  }
  else if(material_privilege === "1"){
    $('#teach_material_privilege_add').val("物料登记");
  }
  else if(material_privilege === "2"){
    $('#teach_material_privilege_add').val("物料申购");
  }
  else {
    $('#teach_material_privilege_add').val("");
  }

  // 判断加班权限
  if(overtime_privilege === "0"){
    $('#teach_overwork_privilege_add').val("无");
  }
  else if(overtime_privilege === "1"){
    $('#teach_overwork_privilege_add').val("开放管理");
  }
  else {
    $('#teach_overwork_privilege_add').val("");
  }
  // console.log(batch);
}
// 修改一个教师
function editOneTeacher(){
  let tid = $('#teach_nickname_add').val();
  let tname = $('#teach_name_add').val();
  let role = $('#teach_role_add').val();
  let material_privilege = $('#teach_material_privilege_add').val();
  let overtime_privilege = $('#teach_overwork_privilege_add').val();
  let t_group_id = $('#teachGroupFormControlSelect').val();
  // 判断物料权限
  if(material_privilege === "无"){
    material_privilege = "0";
  }
  else if(material_privilege === "物料登记"){
    material_privilege = "1";
  }
  else if(material_privilege === "物料申购"){
    material_privilege = "2";
  }
  else {
    material_privilege = "";
  }

  // 判断加班权限
  if(overtime_privilege === "无"){
    overtime_privilege = "0";
  }
  else if(overtime_privilege === "开放管理"){
    overtime_privilege = "1";
  }
  else {
    overtime_privilege = "";
  }

  // 判断教师组
  if(t_group_id === "选择教师组"){
    t_group_id = "0";
  }

  // console.log(tid);
  // var data = JSON.stringify({'tid': tid, 'tname': tname, 'role': role, 'material_privilege': material_privilege, 'overtime_privilege': overtime_privilege, 't_group_id': t_group_id});
  $.ajax({
    type: 'post',
    url: base_url + '/teacher/updateTeacher',
    data : {
      'tid': tid,
      'tname': tname,
      't_group_id': t_group_id,
      'role': role,
      'material_privilege': material_privilege,
      'overtime_privilege': overtime_privilege
    },
    // contentType : "application/json",              //发送至服务器的类型
    dataType : "json",
    success: function(data){
      // console.log(data);
      if(data.status === 0){
        // console.log(data);
        swal(
          '更新成功',
          '更新教师信息成功',
          'success'
        );
        getAllGroup_StuList();
      }
      else{
        swal(
          '更新失败',
          String(data.message),
          'error'
        );
      }
      getAllGroup_StuList
    }
  });
}

// 重置一个学生的密码
function initOneTeacherPassword(obj){
  console.log(obj);
  let tid = obj.getAttribute('tid');
  let spwd = hex_md5("123456");
  let senddata = JSON.stringify([{'id': tid,'pwd': spwd}]);
  swal({
	  title: '确定重置密码吗？',
	  text: '确定重置该教师的密码吗？你将无法撤回此操作！',
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
              '重置密码成功，该教师的密码已经恢复初始密码：123456',
              'success'
            );
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
