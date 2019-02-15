define(['jquery','config/global'],function($,g){
  function logout(){
    g.post_query(
      '/logout'
    );
    localStorage.removeItem('user');
    window.location.href = './login.html'
  }
  $('#logout_tip').click(logout);
});


 // $.ajax({
    //   type: 'post',
    //   // async: false,
    //   url: base_url + '/logout',
    //   datatype: 'json',
    //   data: {},
    //   success: function(){
    //     window.location.href = "../login.html";
    //   },
    //   error: function(){
    //     window.location.href = "../login.html";
    //   }
    // });