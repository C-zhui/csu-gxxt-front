var base_url = 'http://134.175.152.210:8084';

$("#login_submit").click(function(){
  let username = $('#username').val();
  let password = $('#password').val();
  password = hex_md5(password);
  console.log(username);
  console.log(password);
  $.ajax({
    type: 'post',
    async: false,
    url: base_url + '/login',
    datatype: 'json',
    data: {
      'name': username,
      'password': password
    },
    // beforeSend: function(xhr) {
    //   xhr.withCredentials = true;
    // },
    crossDomain:true,
    success: function(data){
      // console.log(data);
      if(data.status === 0){
        // console.log(data);
        basicInfo = data.data;
        if(data.data["身份"] === "admin") {
          // window.location.href = './manager/iindex.html';
          window.location.href = './manager/student-manage.html';
        }
        else if (data.data["身份"] === "teacher") {
          window.location.href = './teacher/teach-schedule.html';
        }
        else if (data.data["身份"] === "student") {
          window.location.href = './student/courses.html';
        }
      }
      else{
        console.log(data);
        swal(
          '登录失败',
          String(data.message),
          'error'
        );
      }
    },
  });
});
