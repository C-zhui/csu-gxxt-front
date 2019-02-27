require(['jquery', 'swal', 'api/apiobj', 'util/cut_page3', 'api/material','api/experiment', 'flatpickr'], function ($, swal, api, CutPage) {
    'use strict';

    //分页每页的行数
    const pageSize = 5;

    $(function () {
        $(".mycalendar").flatpickr();
        // let userInfo = {"角色":"管理员","物料权限":"1"}
        let userInfo = JSON.parse(localStorage.getItem('user'));
        if(userInfo["角色"]==="管理员"){
            $(".outNumber-card").css("display","block");
        }
        else{
            let auth = userInfo["物料权限"];
            if((auth&(1<<0))===1){
                $(".outNumber-card").css("display","block");
            }
        }
        init_data();


// 初始化页面数据
        function init_data() {
            // 刷新库存列表
            getAllMaterial();
            // 根据条件显示物料登记记录
            getSelectedPurchase();

        }

// 刷新库存列表
        function getAllMaterial() {
            return api.material.getAllMaterial().done(function (data) {
                if (data.status === 0) {
                    let data_arr = data.data;
                    let tableBody = $('#material_record_list').empty();
                    let historySelect = $('#record_history_selset_meterail').empty().append('<option>选择物料种类</option>');
                    let select = $('#select_meterial').empty();
                    for (let i = 0; i < data_arr.length; i++) {
                        let tr = $('<tr></tr>');
                        $('<td></td>').text(data_arr[i].clazz).appendTo(tr);
                        $('<td></td>').text(data_arr[i].num).appendTo(tr);
                        tableBody.append(tr);
                        let option = $('<option></option>').text(data_arr[i].clazz);
                        historySelect.append(option);
                        select.append(option.clone());
                    }
                    //设置分页
                    CutPage.cutPage('material-record-table', pageSize);

                }
            })
        }

// 派出物料
        $('#decr-material-Num').click(function () {
            let num = $('#distribute_num').val();
            let clazz = $('#select_meterial').val();
            let sid = $('#distribute_stu_id').val();
            let sname = $('#distribute_stu_name').val();

            return api.material.decrMaterialNum(num, clazz, sid, sname).done(function (data) {
                if (data.status === 0) {
                    swal(
                        '派出成功',
                        '派出物料记录成功',
                        'success'
                    );
                    // 清空派出物料时填的内容
                    $('#distribute_num').val("");
                    $('#select_meterial').val("");
                    $('#distribute_stu_id').val("");
                    $('#distribute_stu_name').val("");
                    init_data();
                } else {
                    // console.log(data);
                    swal(
                        '派出失败',
                        '物料数量不足',
                        'error'
                    );
                }
            });
        });

// 根据条件显示物料登记记录
        $('#get-select-purchase').click(getSelectedPurchase);

        function getSelectedPurchase() {
            let start_time = $('#start_time').val();
            let end_time = $('#end_time').val();
            let clazz = $('#record_history_selset_meterail').val();
            let sid = $('#stu_id').val();
            let sname = $('#stu_name').val();

            if (clazz === "选择物料种类") {
                clazz = "";
            }
            api.material.getApplys(clazz, sid, sname, start_time, end_time).done(function (data) {
                if (data.status === 0) {
                    let data_arr = data.data;
                    let tableBody = $('#receive-materiel-table-body').empty();
                    for (let i = 0; i < data_arr.length; i++) {
                        let tr = $('<tr></tr>');
                        $('<td></td>').text(data_arr[i].apply_time.substr(0,16)).appendTo(tr);
                        $('<td></td>').text(data_arr[i].sname).appendTo(tr);
                        $('<td></td>').text(data_arr[i].sid).appendTo(tr);
                        $('<td></td>').text(data_arr[i].clazz).appendTo(tr);
                        $('<td></td>').text(data_arr[i].num).appendTo(tr);
                        $('<td></td>').text(data_arr[i].tname).appendTo(tr);
                        tableBody.append(tr);
                    }
                    CutPage.cutPage('receive-materiel-table', pageSize);
                } else {
                    // console.log(data);
                }
            })
        }

//导出领取记录excel
        $("#export-excel").click(exportRecord);

        function exportRecord() {
            var $table = $('#receive-materiel-table');
            var $trs = $('tr', $table);
            var data = []

            $trs.each(function (i) {
                var row = []
                if (i !== 0) {
                    $('td', this).each(function () {
                        row.push($(this).text());
                    });
                } else {
                    $('th', this).each(function (i) {
                        row.push($(this).text())
                    })
                }
                data.push(row)
            });
            api.experiment.send_download_excel(data);
        }

// ========================================================================
// 6、其他函数

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
            };
            if (/(y+)/.test(format))
                format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(format))
                    format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            return format;
        };

// 获取标准时间格式
        function chGMT(gmtDate) {
            var mydate = new Date(gmtDate);
            mydate.setHours(mydate.getHours() + 8);
            // return mydate.format("yyyy-MM-dd hh:mm:ss");
            return mydate.format("yyyy-MM-dd hh:mm");
        }
    });
});
