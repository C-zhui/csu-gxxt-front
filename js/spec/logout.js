// var base_url = 'http://134.175.152.210:8084';

function logout(){
  $.ajax({
    type: 'post',
    // async: false,
    url: base_url + '/logout',
    datatype: 'json',
    data: {},
    success: function(){
      window.location.href = "../login.html";
    },
    error: function(){
      window.location.href = "../login.html";
    }
  });
}
