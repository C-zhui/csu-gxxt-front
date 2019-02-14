require(['jquery', 'lodash', 'moment', 'cnofig/global'], function
  ($, _, moment, g) {

  $(function () {
    init_data();
  });

  var base_url = g.base_url;

  function init_data() {
    // 获取所有教师组
    getAllGroup();
    // 展示值班信息初始化
    getTeacherOverworkFromStudent();
    // 获取“我的申请”记录
    getMyOverworkApply();
  }

  // 获取所有教师组
  function getAllGroup() {
    // api_group.getAllGroup() 
    post_query('/group/getAllGroup', {})
      .done(function (data) {
        if (data.status === 0) {
          var data_arr = data.data;
          var selector = $('#request_select_process').empty()
          $('<option>选择工种</option>').appendTo(selector);
          _.each(data_arr, function (val) {
            $('<option></option>').text(val.t_group_id).appendTo(selector);
          });
        } else {
          console.log('err getallgroup')
          fetch_err(data);
        }
      }).fail(net_err)
  }

  // 新增开放申请
  function addOverworkApply() {
    let begin = $('#request_start_time').val();
    let pro_name = $('#request_select_process').val();
    let duration = $('#request_extra_last_time').val();
    let reason = $('#request_extra_reason').val();
    begin += ":00";

    post_query('/overwork/addOverworkApply', {})
      .done(function (data) {
        if (data.status === 0) {
          // console.log(data);
          swal(
            '新增成功',
            '新增开放申请成功',
            'success'
          );
        }
        else {
          console.log('err addOverworkApply')
          fetch_err(data);
          // // console.log(data);
          // swal(
          //   '新增失败',
          //   '新增开放申请失败',
          //   'error'
          // );
        }
      }).fail(net_err)
    // $.ajax({
    //   type: 'post',
    //   url: base_url + ,
    //   datatype: 'json',
    //   data: {
    //     'begin': begin,
    //     'pro_name': pro_name,
    //     'duration': duration,
    //     'reason': reason
    //   },
    //   success: function (data) {

    //   }
    // });
  }

  // 展示值班信息
  function getTeacherOverworkFromStudent() {

    post_query('/overwork/getTeacherOverworkFromStudent')
      .done(function (data) {
        console.log(data);
        if (data.status === 0) {
          let data_arr = data.data;
          var delta_time;
          html = '';
          for (let i = 0; i < data_arr.length; i++) {
            delta_time = getGMThour(data_arr[i].overwork_time_end) - getGMThour(data_arr[i].overwork_time)
            html += '<li><p><a href="#">' + chGMT(data_arr[i].overwork_time) + '&emsp;&emsp;' + data_arr[i].pro_name + '&emsp;&emsp;' + data_arr[i].tname + '&emsp;&emsp;' + delta_time + 'h </a></p></li>'
          }
          $('#zhiban_info ul').html(html);   //有数据了再打开这一行
        } else {
          console.log('err getTeacherOverworkFromStudent')
          fetch_err(data)
        }
      })
      .fail(net_err);

    // $.ajax({
    //   type: 'post',
    //   url: base_url + '/overwork/getTeacherOverworkFromStudent',
    //   datatype: 'json',
    //   data: {

    //   },
    //   success: function (data) {
    //     console.log(data);
    //     if (data.status === 0) {
    //       let data_arr = data.data;
    //       var delta_time;
    //       html = '';
    //       for (let i = 0; i < data_arr.length; i++) {
    //         delta_time = getGMThour(data_arr[i].overwork_time_end) - getGMThour(data_arr[i].overwork_time)
    //         html += '<li><p><a href="#">' + chGMT(data_arr[i].overwork_time) + '&emsp;&emsp;' + data_arr[i].pro_name + '&emsp;&emsp;' + data_arr[i].tname + '&emsp;&emsp;' + delta_time + 'h </a></p></li>'
    //       }
    //       $('#zhiban_info ul').html(html);   //有数据了再打开这一行
    //     }
    //   }
    // });
  }

  // 获取“我的申请”记录
  function getMyOverworkApply() {
    post_query('/overwork/getMyOverworkApply')
      .done(function (data) {
        if (data.status === 0) {
          let data_arr = data.data;
          html = '';
          for (let i = 0; i < data_arr; i++) {
            html += '<tr><td>' + chGMT(data_arr[i].overwork_time) + '</td><td>' + data_arr[i].pro_name + '</td><td>' + data_arr[i].reason + '</td></tr>';
          }
          $('#adminTbody').html(html);   //有数据了再打开这一行
        } else {
          console.log('err getMyOverworkApply')
          fetch_err(data)
        }
        // 教师值班记录分页初始化
        goPage(1, 10);
      }).fail(net_err);

    // $.ajax({
    //   type: 'post',
    //   url: base_url + '/overwork/getMyOverworkApply',
    //   datatype: 'json',
    //   data: {},
    //   success: function (data) {
    //     if (data.status === 0) {
    //       let data_arr = data.data;
    //       html = '';
    //       for (let i = 0; i < data_arr; i++) {
    //         html += '<tr><td>' + chGMT(data_arr[i].overwork_time) + '</td><td>' + data_arr[i].pro_name + '</td><td>' + data_arr[i].reason + '</td></tr>';
    //       }
    //       $('#adminTbody').html(html);   //有数据了再打开这一行
    //     }
    //     // 教师值班记录分页初始化
    //     goPage(1, 10);
    //   }
    // });
  }

  // 格林威治时间的转换
  Date.prototype.format = function (format) {
    var o = {
      "M+": this.getMonth() + 1, //month
      "d+": this.getDate(), //day
      "h+": this.getHours(), //hour
      "m+": this.getMinutes(), //minute
      "s+": this.getSeconds(), //second
      "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
      "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format))
      format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    return format;
  }
  // 获取标准时间格式
  function chGMT(gmtDate) {
    var mydate = new Date(gmtDate);
    mydate.setHours(mydate.getHours() + 8);
    // return mydate.format("yyyy-MM-dd hh:mm:ss");
    return mydate.format("yyyy-MM-dd hh:mm");
  }
  // 获取小时
  function getGMThour(gmtDate) {
    var mydate = new Date(gmtDate);
    mydate.setHours(mydate.getHours() + 8);
    // return mydate.format("yyyy-MM-dd hh:mm:ss");
    return Number(mydate.format("hh"));
  }

})
