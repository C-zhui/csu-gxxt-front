require(['jquery', 'lodash', 'api/apiobj', 'config/global', 'config/config-course-schedule', 'api/student', 'api/experiment', 'api/user'], function
  ($, _, api, g, ccs) {

  api.user.getInfo()
  .done(function (data) {
    if (data.status === 0) {
      console.log(data)
      get_fill_class_table(data.data.id)
    } else {
      g.fetch_err(data)
    }
  })
  .fail(g.net_err)

  function get_fill_class_table(sid) {
    console.log(sid)
    api.experiment.getClass(sid)
      .done(function (data) {
        if (data.status === 0) {
          console.log(data)
          fill_class_table(data.data)
        } else {
          g.fetch_err(data)
        }
      })
      .fail(g.net_err)
  }

  var $class_table = $('#class_table');
  function fill_class_table(data) {
    var $tbody = $class_table.find('tbody');
    var $temp = $('#templates #class_row').children();
    _.each(data, function (d) {
      var $cloneTemp = $temp.clone();
      $cloneTemp.find('.time').text(ccs.time_quant_formated(d.time_quant)).end()
        .find('.pro_name').text(d.pro_name).end()
        .find('.batch_name').text(d.batch_name || '').end()
        .find('.s_group_id').text(d.s_group_id || '').end()
      $cloneTemp.appendTo($tbody);
    });
  }



});