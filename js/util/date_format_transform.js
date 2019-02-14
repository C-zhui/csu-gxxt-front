define(['moment'], function (moment) {
    return {
        dateToWeekDayObjFactory: function (beginDate) { // begin date 为第一周星期一的时间，需要设置
            var begin = moment(beginDate)
            return function (toDate) {
                var to = moment(toDate);
                var days = to.diff(begin, 'days');
                var week = (days - days % 7) / 7;
                var day = days % 7;
                return {
                    week: week + 1,
                    day: day + 1
                }
            }
        },
        weekDayToDateObjFactory: function (beginDate) {
            var begin = moment(beginDate)
            return function (wd) {
                var days = wd.week * 7 - 7 + wd.day - 1;
                var date = begin.add(days, 'days')
                begin = moment(beginDate)
                return date.format('YYYY-MM-DD')
            }
        }
    }
})