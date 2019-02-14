define(['lodash'], function (_) {
  var weekRange = _.range(1, 21, 1);
  var dayRange = [null, '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  var timeRangeStep = 2;
  var timeRange = _.range(1, 10, timeRangeStep);
  var class_time_container_line_size = 8;

  function time_quant_formated(time_quant) {
    var index_time = parseInt(time_quant.slice(-2));
    var time = this.timeRange[index_time]
    return time_quant.slice(0, -3) + '(' + _.range(time, time + this.timeRangeStep) + '节)'
  }


  return {
    weekRange: weekRange,
    dayRange: dayRange,
    timeRangeStep: timeRangeStep,
    timeRange: timeRange,
    class_time_container_line_size: class_time_container_line_size,
    time_quant_formated: time_quant_formated
  }
});