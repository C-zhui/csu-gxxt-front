require(['jquery', 'lodash', 'moment', 'api/apiobj', 'config/global', 'util/cut_page3', 'api/group', 'api/overwork', 'flatpickr'], function
  ($, _, moment, api, g,CutPage) {

  const pageSize = 5;

  $(function () {
    init_data();
  });
  $(".mycalendar").flatpickr();

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
    api.group.getAllTeacherGroup()
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
          console.log(data);
        }
      }).fail(console.log)
  }

  // 新增开放申请
  $('#add_overwork_apply').click(addOverworkApply);
  function addOverworkApply() {
    let begin = $('#request_start_time').val();
    let pro_name = $('#request_select_process').val();
    let duration = $('#request_extra_last_time').val();
    let reason = $('#request_extra_reason').val();
    begin += ":00";

    api.overwork.addOverworkApply(begin, pro_name, duration, reason)
        .done(function (data) {
          if (data.status === 0) {
            // console.log(data);
            swal(
                '新增成功',
                '新增开放申请成功',
                'success'
            );
            getMyOverworkApply();
          } else {
            console.log('err addOverworkApply')
            console.log(data);
          }
        }).fail(console.log);

  }

  // 展示值班信息
  function getTeacherOverworkFromStudent() {
    g.post_query('/overwork/getTeacherOverworkFromStudent')
      .done(function (data) {
        console.log(data);
        if (data.status === 0) {
          let data_arr = data.data;
          var delta_time;
          html = '';
          for (let i = 0; i < data_arr.length; i++) {
            delta_time = getGMThour(data_arr[i].overwork_time_end) - getGMThour(data_arr[i].overwork_time)
            html += '<li class="clearfix"><div class="row"><div class="ul-time col-5">' + chGMT(data_arr[i].overwork_time) +'</div><div class="ul-pro-name col-4"> ' + data_arr[i].pro_name + '</div><div class="ul-name col-2"> '+ data_arr[i].tname + '</div><div class="ul-hour col-1"> ' + delta_time + 'h </div></div></li>'
          }
          $('#zhiban_info ul').html(html);   //有数据了再打开这一行
        } else {
          console.log('err getTeacherOverworkFromStudent')
          console.log(data)
        }
      })
      .fail(console.log);
  }

  // 获取“我的申请”记录
  function getMyOverworkApply() {
    g.post_query('/overwork/getMyOverworkApply')
      .done(function (data) {
        if (data.status === 0) {
          let data_arr = data.data;
          html = '';
          for (let i = 0; i < data_arr.length; i++) {
            html += '<tr><td>' + chGMT(data_arr[i].overwork_time) + '</td><td>' + data_arr[i].pro_name + '</td><td>' + data_arr[i].reason + '</td></tr>';
          }
          $('#adminTbody').html(html);   //有数据了再打开这一行
        } else {
          console.log('err getMyOverworkApply')
          console.log(data)
        }
        // 教师值班记录分页初始化
        CutPage.cutPage("extra-table",pageSize);
      }).fail(console.log);
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