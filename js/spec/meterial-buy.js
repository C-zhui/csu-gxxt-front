require(['jquery', 'lodash', 'swal', 'api/apiobj', 'api/material', 'api/applyFPchse', 'api/purchase', 'api/reim', 'api/save', 'api/user', 'util/cut_page3', 'bootstrapTable', 'flatpickr'], function ($, _, swal, api) {
    'use strict';
    let string_array = ["j", "s", "c", "b", "h", "r"]; //定义各功能模块名称字母代表
    let selectedPurchase = []; //定义申购表格中选中的行申购编号
    let optionsForPurchaser = []; //定义所有采购人选项
    let optionsForPurchaserText = ""; //用来存放采购人选项html文本
    let selectedPurPurchase = []; //定义采购表格中选中的行id
    let selectedRemi = []; //定义报账记录中的行id
    let user = {}; //记录当前用户信息
    const pageSize = 5; //分页每页行数
    let tname = "";
    $(function () {
        $(".mycalendar").flatpickr();
        init_data();
        api.user.getInfo().done(function (data) {
            if (data.status === 0) {
                user = data.data;
                tname = data.data["姓名"];
                console.log(tname);
                setPage();
            }
        });

// 根据权限设置界面
        function setPage() {
            if(user["角色"]!=="管理员"){
                console.log(233)
                $(".material_manage_operate").css("display","none");
                $(".material_add_apply_operate").css("display","none");
                $(".materal_add_apply_verify").css("display","none");
                $("#materal-purchase").css("display","none");
                $("#materal-store").css("display","none");
                $(".materal_purchase_operate").css("display","none");
                $(".materal_remib_operate").css("display","none");
                $(".materal_add_remib_operate").css("display","none");
                $(".materal_remib_verify_operate").css("display","none");
                $(".materal_store_operate").css("display","none");
                switch (user["物料权限"]){
                    case "1":$(".material_add_apply_operate").css("display","block");
                        break;  //申请购买物料权限
                    case "2":$("#materal-purchase").css("display","block");
                        $(".materal_purchase_operate").css("display","block");
                        $(".materal_remib_operate").css("display","block");
                        $(".materal_add_remib_operate").css("display","block");
                        break;  //采购权限
                    case "3":$("#materal-store").css("display","block");
                        $(".materal_store_operate").css("display","block");
                        break;  //入库权限
                    case "0":break;
                }
            }
        }
// 初始化页面数据
        function init_data() {
            // 刷新库存列表
            getAllMaterial();
            // 获取所有申购权限的人的信息
            getApplyer();
            // 获取所有采购权限的人的信息
            getPurchaser();
            // 获取所有入库权限的人的信息
            getStorer();
            // 获取所有物料申购记录
            getAllApplyFPchse();
            // 获取所有物料申购记录（审核）
            getApplyFPchseVerify();
            // 获取所有物料采购记录
            getPurchase();
            // 获取所有采购报账记录
            getRemi();
            // 获取所有采购报账记录（审核）
            getRemiVerify();
            // 获取所有入库记录
            getSaveBy5();
            // 根据权限设置页面
        }


// 库存页*********************************
// 获取所有物料
        function getAllMaterial() {
            $('#new_semester').val("");
            return api.material.getAllMaterial()
                .done(function (data) {
                    let material_class = [];
                    let data_arr = data.data;
                    let tableBody = $('#inventory-table-body').empty();
                    for (let i = 0; i < data_arr.length; i++) {
                        let tr = $('<tr></tr>');
                        $('<td></td>').text(data_arr[i].clazz).appendTo(tr);
                        $('<td></td>').text(data_arr[i].num).appendTo(tr);
                        let deleteImage = $('<img class="delete-image" src="../../icon/delete-item.svg">').data('id', data_arr[i].clazz).click(deleteOneMateral);
                        if(user["身份"]==="管理员")
                            $('<td></td>').append(deleteImage).appendTo(tr);
                        tableBody.append(tr);
                        material_class.push(data_arr[i].clazz);
                    }
                    // 导入所有物料种类
                    let html2 = '<option>物料种类</option>';
                    for (let j = 0; j < material_class.length; j++) {
                        html2 += '<option>' + material_class[j] + '</option>';
                    }
                    // $('#kelect_meterial').html(html2);
                    for (let k = 0; k < 6; k++)
                        $('#' + string_array[k] + 'material').html(html2);
                    $("#add_apply_material").html(html2);
                    new CutPage('inventory-table', pageSize);
                });
        }

// 删除一种物料
        function deleteOneMateral(obj) {
            swal({
                title: "真的删除该种物料吗？",
                type: "info",
                showCancelButton: true,
                confirmButtonText: "确认",
                cancelButtonText: "取消"
            }).then(function (isConfirm) {
                if (isConfirm.value) {
                    let clazz = obj.data('id');
                    api.material.deletePurchase(clazz)
                        .done(function (data) {
                            if (data.status === 0) {
                                swal(
                                    '删除成功',
                                    '删除物料成功',
                                    'success'
                                );
                                getAllMaterial();
                            } else {
                                swal(
                                    '删除失败',
                                    '删除物料失败，请重试！',
                                    'error'
                                );
                            }
                        })
                } else {
                    swal({
                        title: "已取消",
                        type: "error"
                    })
                }
            })
        }

// 添加一种新的物料
        $('#add-one-material').click(function () {
            let clazz = $('#new_semester').val();
            if (clazz === "") {
                swal(
                    '物料种类为空',
                    '请先输入物料名称',
                    'info'
                );
            } else {
                api.material.addPurchase("0", clazz)
                    .done(function (data) {
                        if (data.status === 0) {
                            swal(
                                '添加成功',
                                '添加新物料成功',
                                'success'
                            );
                            getAllMaterial();
                        } else {
                            swal(
                                '添加失败',
                                '添加新物料失败，请重试！',
                                'error'
                            );
                        }
                    })
            }
        });

// 其他记录页******************************
// 获取所有申购人信息
        function getApplyer() {
            api.applyFPchse.getAllNameByAuthType(1)
                .done(function (data) {
                    let data_arr = data.data;
                    let html = '<option>申购人</option>';
                    for (let i = 0; i < data_arr.length; i++) {
                        html += '<option>' + data_arr[i] + '</option>';
                    }

                    $('#' + string_array[0] + 'apply_person').html(html);
                })
        }

// 获取所有采购人信息
        function getPurchaser() {
            api.applyFPchse.getAllNameByAuthType(2)
                .done(function (data) {
                    optionsForPurchaser = ["采购人"];
                    let data_arr = data.data;
                    let html = '<option>采购人</option>';

                    for (let i = 0; i < data_arr.length; i++) {
                        html += '<option>' + data_arr[i] + '</option>';
                        optionsForPurchaser.push(data_arr[i])
                    }
                    optionsForPurchaserText = html;
                    for (let i = 0; i < 4; i++) {
                        $('#' + string_array[i] + 'purchase_person').html(html);
                    }
                })
        }

// 获取所有入库人信息
        function getStorer() {
            api.applyFPchse.getAllNameByAuthType(3)
                .done(function (data) {
                    let data_arr = data.data;
                    let html = '<option>入库人</option>';
                    for (let i = 0; i < data_arr.length; i++) {
                        html += '<option>' + data_arr[i] + '</option>';
                    }
                    $('#' + string_array[5] + 'store_person').html(html);
                })
        }

// 物料申购页
// 获取所有申购记录
        function getAllApplyFPchse() {
            api.applyFPchse.getAllApplyFPchse()
                .done(fillApplyTable)
        }

// 根据条件显示物料申购记录
        $('#get-select-apply').click(function () {
            let postData = {};
            postData.clazz = $('#jmaterial').val();
            postData.apply_tname = $('#japply_person').val();
            postData.startTime = $('#jstart_time').val();
            postData.endTime = $('#jend_time').val();
            postData.pur_tname = $("#jpurchase_person").val();
            postData.purchase_id = $("#jpurchase_number").val();
            if (postData.apply_tname === "申购人") {
                postData.apply_tname = "";
            }
            if (postData.pur_tname === "采购人") {
                postData.pur_tname = "";
            }
            if (postData.clazz === "物料种类") {
                postData.clazz = "";
            }
            if (postData.clazz === "" && postData.apply_tname === "" && postData.startTime === ""
                && postData.endTime === "" && postData.pur_tname === "" && postData.purchase_id === "") {
                api.applyFPchse.getAllApplyFPchse()
                    .done(fillApplyTable)
            } else {
                api.applyFPchse.getSelectedPurchase(postData)
                    .done(fillApplyTable)
            }
        });

// 填充申购表格
        function fillApplyTable(data) {
            if (data.status === 0) {
                let data_arr = data.data;
                let tableData = [];

                for (let i = 0; i < data_arr.length; i++) {
                    let tableRow = {
                        purchaseId: data_arr[i].purchase_id,
                        applyTime: data_arr[i].apply_time,
                        applyName: data_arr[i].apply_tname,
                        clazz: data_arr[i].clazz,
                        applyNum: data_arr[i].apply_num,
                        applyRemark: data_arr[i].apply_remark === null ? '' : data_arr[i].apply_remark,
                        applyVertify: data_arr[i].apply_vertify === null || data_arr[i].apply_vertify === false ? '待审核' : '已审核', //审核状态
                        applyVertTname: data_arr[i].apply_vert_tname === null ? '' : data_arr[i].apply_vert_tname, //审核人
                        purNum: data_arr[i].pur_num === null ? '' : data_arr[i].pur_num, //采购总数
                        remibNum: data_arr[i].remib_num === null ? '' : data_arr[i].remib_num, //报账总数
                        purTname: data_arr[i].pur_tname === null ? '' : data_arr[i].pur_tname, //采购人
                        saveNum: data_arr[i].save_num === null ? '' : data_arr[i].save_num //入库总数
                    };
                    tableData.push(tableRow);

                }

                $("#jadminTbody").bootstrapTable("destroy").bootstrapTable({
                    pagination: false,
                    data: tableData,
                    fixedColumns: true,
                    fixedNumber: 4,
                    onCheck: function (row) {
                        selectedPurchase.push(row.purchaseId);
                    },
                    onUncheck: function (row) {
                        _.pull(selectedPurchase, row.purchaseId);
                    },
                    onCheckAll: function () {
                        let allData = tableData;
                        selectedPurchase = [];
                        for (let i = 0; i < allData.length; i++) {
                            selectedPurchase.push(allData[i].purchaseId);
                        }
                    },
                    onUncheckAll: function () {
                        selectedPurchase = [];
                    },
                    columns: [
                        {
                            checkbox: true,
                        }
                    ]

                });
                // 分页初始化
                new CutPage('jadminTbody', pageSize);
                // goPageBT("j", 1, 5)

            }
        }

// 生成申购单
        $('#export-apply').click(function () {
            let postdata = {};
            postdata.purchase_ids = selectedPurchase;
            // console.log(selectedPurchase)
            api.applyFPchse.downloadApply(postdata)
                .done(function (data) {

                })
        });

// 导出excel
        $('#export-apply').click(function () {
            let postdata = {};
            postdata.purchase_ids = selectedPurchase;
            // console.log(selectedPurchase)
            api.applyFPchse.downloadApplyExcel(postdata)
                .done(function (data) {

                })
        });

// 新增申购记录
        $('#add-one-apply').click(function () {
            let post_data = {};
            post_data.clazz = $("#add_apply_material").val();
            post_data.num = parseInt($("#add_apply_number").val());
            post_data.apply_remark = $("#add_apply_note").val();
            api.applyFPchse.addApplyFPchse(post_data)
                .done(function (data) {
                    $("#add_apply_material").val("");
                    $("#add_apply_number").val(0);
                    $("#add_apply_note").val("");
                    if (data.status === 0) {
                        swal(
                            '申购成功',
                            '申购物料成功',
                            'success'
                        );
                        init_data();
                    } else {
                        swal(
                            '申购失败',
                            '申购物料失败，请重试！',
                            'error'
                        );
                    }
                })
        });

// 获取所有申购记录（审核部分）
        $('#get-apply-FPchse-verify').click(getApplyFPchseVerify);

        function getApplyFPchseVerify() {
            let postData = {};
            postData.clazz = $('#smaterial').val();
            postData.startTime = $('#sstart_time').val();
            postData.endTime = $('#send_time').val();
            postData.purchase_id = $("#spurchase_number").val();
            if (postData.clazz === "物料种类" || postData.clazz === "暂无选项") {
                postData.clazz = "";
            }
            let auditStatus = $("#spurchase_audit_status").val();
            if (auditStatus === '待审核') {
                postData.apply_verify = false
            } else if (auditStatus === '已审核') {
                postData.apply_verify = true
            }
            api.applyFPchse.getSelectedPurchase(postData)
                .done(fillApplyTableVerify)
        }

// 填充申购审核表格
        function fillApplyTableVerify(data) {
            let data_arr = data.data;
            let tableBody = $('#sadminTbody').empty();
            for (let i = 0; i < data_arr.length; i++) {
                if (data_arr[i].apply_remark === null)
                    data_arr[i].apply_remark = '';
                if (data_arr[i].apply_vertify === true)
                    data_arr[i].vertify = "已审核";
                else if (data_arr[i].apply_vertify === false)
                    data_arr[i].vertify = "待审核";
                let tr = $('<tr></tr>');
                $('<td></td>').text(data_arr[i].purchase_id).appendTo(tr);
                $('<td></td>').text(data_arr[i].apply_time).appendTo(tr);
                $('<td></td>').text(data_arr[i].apply_tname).appendTo(tr);
                $('<td></td>').text(data_arr[i].clazz).appendTo(tr);
                $('<td></td>').text(data_arr[i].apply_remark).appendTo(tr);
                $('<td></td>').text(data_arr[i].vertify).appendTo(tr);
                $('<td class="input_td"><div class="modify' + data_arr[i].purchase_id + '">' + data_arr[i].apply_num + '</div><input type="number" class="modifyInput' + data_arr[i].purchase_id + ' form-control" value="' + data_arr[i].apply_num + '" id="modifyNum' + data_arr[i].purchase_id + '"></td>').appendTo(tr);
                $('<td class="input_td"><div class="modify' + data_arr[i].purchase_id + '">' + data_arr[i].pur_tname + '</div><select class="modifyInput' + data_arr[i].purchase_id + ' form-control" id="options' + data_arr[i].purchase_id + '"></select></td>').appendTo(tr);
                let checkImage = $('<img src="../../icon/check.svg" class="row-image col-sm-4 col-xs-4 ' + data_arr[i].pur_tname + '" id="verify' + data_arr[i].purchase_id + '">').click(function () {
                    verifyOneApply(this);
                });
                let editImage = $('<img src="../../icon/edit.svg" class="row-image col-sm-4 col-xs-4 ' + data_arr[i].pur_tname + '" id="modify' + data_arr[i].purchase_id + '">').click(function () {
                    modifyOneApply(this);
                });
                let deleteImage = $('<img src="../../icon/delete.svg" class="row-image col-sm-4 col-xs-4" id="delete' + data_arr[i].purchase_id + '"> ').click(function () {
                    deleteOneApply(this);
                });
                let row = $('<div class="row"></div>').append(checkImage).append(editImage).append(deleteImage);
                $('<td></td>').append(row).appendTo(tr);

                tableBody.append(tr);
            }
            // 分页初始化
            new CutPage('s-admin-table', pageSize);
        }

// 删除申购记录
        function deleteOneApply(data) {
            swal({
                title: "真的删除该记录吗？",
                type: "info",
                showCancelButton: true,
                confirmButtonText: "确认",
                cancelButtonText: "取消"
            }).then(function (isConfirm) {
                if (isConfirm.value) {
                    let id = data.id.substring(6, data.id.length)
                    api.applyFPchse.deleteApplyFPchse(id)
                        .done(function (returndata) {
                            // console.log(returndata)
                            if (returndata.status === 0) {
                                swal({
                                    title: "删除成功!",
                                    type: "success"
                                }).then(function () {
                                    init_data()
                                })
                            } else {
                                swal({
                                    title: "删除失败!",
                                    type: "error"
                                })
                            }

                        })
                } else {
                    swal({
                        title: "已取消",
                        type: "error"
                    })
                }
            })


        }

// 修改申购记录
        function modifyOneApply(data) {
            let id = data.id.substring(6, data.id.length)
            $(".modify" + id).hide();
            $(".modifyInput" + id).show();
            $("#options" + id).html(optionsForPurchaserText)

            for (let i = 0; i < optionsForPurchaser.length; i++) {
                if ($("#" + data.id).hasClass(optionsForPurchaser[i])) {
                    $("#options" + id).val(optionsForPurchaser[i])
                    break;
                }
            }
        }

// 确认修改申购记录
        function verifyOneApply(data) {
            let id = data.id.substring(6, data.id.length);
            let postdata = {};
            postdata.purchase_id = id;
            postdata.purchase_tname = $("#options" + id).find("option:selected").text();
            if ($(".modifyInput" + id).css("display") === "none") {
                if (postdata.purchase_tname === "") {
                    for (let i = 0; i < optionsForPurchaser.length; i++) {
                        if ($("#" + data.id).hasClass(optionsForPurchaser[i])) {
                            postdata.purchase_tname = optionsForPurchaser[i];
                            break;
                        }
                    }
                }
            }
            postdata.apply_num = $("#modifyNum" + id).val();
            if (postdata.purchase_tname === "采购人") {
                swal(
                    '提示',
                    "请选择采购人",
                    'error'
                )
            } else {
                api.applyFPchse.applyVerify(postdata)
                    .done(function (data) {
                        if (data.status === 0) {
                            swal(
                                '审核成功',
                                '审核申购记录成功',
                                'success'
                            );
                            init_data();
                        } else {
                            swal(
                                '审核失败',
                                data.message,
                                'error'
                            )
                        }
                    })
            }
        }

// 物料采购页
// 根据条件获取采购记录
        $('#get-purchase').click(getPurchase);

        function getPurchase() {
            let postData = {};
            let cmaterial = $('#cmaterial').val();
            let cstartTime = $('#cstart_time').val();
            let cendTime = $('#cend_time').val();
            let cpurchasePerson = $("#cpurchase_person").val();
            let cpurchaseNumber = $("#cpurchase_number").val();
            postData.clazz = cmaterial === "物料种类" || cmaterial === "暂无选项" ? "%" : cmaterial;
            postData.begin = cstartTime === "" ? "1999-10-10" : cstartTime;
            postData.end = cendTime === "" ? "2999-10-10" : cendTime;
            postData.pur_tname = cpurchasePerson === "采购人" || cpurchasePerson === "暂无选项" ? "%" : cpurchasePerson;
            postData.purchase_id = cpurchaseNumber === "" ? "%" : cpurchaseNumber;

            api.purchase.getPurchase(postData)
                .done(fillPurchaseTable)
        }

// 填充采购记录表格
        function fillPurchaseTable(data) {
            if (data.status === 0) {
                let data_arr = data.data;
                let tableData = [];

                for (let i = 0; i < data_arr.length; i++) {
                    let tableRow = {
                        purchaseId: data_arr[i].purchase_id,
                        purTime: data_arr[i].pur_time,
                        purTname: data_arr[i].pur_tname,
                        clazz: data_arr[i].clazz,
                        purNum: data_arr[i].pur_num,
                        purRemark: data_arr[i].pur_remark === null ? '' : data_arr[i].pur_remark,
                        id: data_arr[i].id
                    };
                    tableData.push(tableRow);

                }

                $("#cadminTbody").bootstrapTable("destroy").bootstrapTable({
                    pagination: false,
                    data: tableData,
                    fixedColumns: true,
                    fixedNumber: 4,
                    onCheck: function (row) {
                        selectedPurPurchase.push(row.id);
                    },
                    onUncheck: function (row) {
                        _.pull(selectedPurPurchase, row.id);
                    },
                    onCheckAll: function () {
                        let allData = tableData;
                        selectedPurchase = [];
                        for (let i = 0; i < allData.length; i++) {
                            selectedPurPurchase.push(allData[i].id);
                        }
                    },
                    onUncheckAll: function () {
                        selectedPurchase = [];
                    },
                    columns: [
                        {
                            checkbox: true,
                        }
                    ]

                });
                // 分页初始化
                new CutPage('cadminTbody', pageSize);
            }
        }

// 新增采购记录
        $('#add-one-purchase').click(addOnePurchase);

        function addOnePurchase() {
            let newPurchase = {};
            newPurchase.purchase_id = $("#add_purchase_num").val();
            newPurchase.pur_time = $("#add_purchase_date").val();
            newPurchase.pur_num = $("#add_purchase_number").val();
            newPurchase.pur_remark = $("#add_purchase_note").val();
            newPurchase.tName = tname;
            api.purchase.addPurchase(newPurchase)
                .done(function (data) {
                    $("#add_purchase_num").val("");
                    $("#add_purchase_date").val("");
                    $("#add_purchase_number").val("");
                    $("#add_purchase_note").val("");
                    if (data.status === 0) {
                        swal(
                            '新增成功',
                            '新增采购物料成功',
                            'success'
                        );
                        init_data();
                    } else {
                        swal(
                            '新增失败',
                            data.message,
                            // '申购物料失败，请重试！',
                            'error'
                        );
                    }
                })
        }

// 生成采购单
        $('#export-purchase').click(exportPurchase);

        function exportPurchase() {
            let postdata = {};
            postdata.purchase_ids = selectedPurPurchase;
            // console.log(selectedPurPurchase)
            api.purchase.downloadPurchase(postdata)
                .done(function (data) {

                })
        }

// 根据条件获取报账记录
        $('#get-remi').click(getRemi);

        function getRemi() {
            let postData = {};
            postData.clazz = $('#bmaterial').val() === "物料种类" || $('#bmaterial').val() === "暂无选项" ? "%" : $('#bmaterial').val();
            postData.begin = $('#bstart_time').val() === "" ? "1999-10-10" : $('#bstart_time').val();
            postData.end = $('#bend_time').val() === "" ? "2999-10-10" : $('#bend_time').val();
            postData.tname = $("#bpurchase_person").val() === "采购人" || $("#bpurchase_person").val() === "暂无选项" ? "%" : $("#bpurchase_person").val();
            postData.purchaseId = $("#bpurchase_number").val() === "" ? "%" : $("#bpurchase_number").val();
            if ($("#bremiburse_audit_status").val() === "审核状态")
                postData.verify = "%";
            else if ($("#bremiburse_audit_status").val() === "待审核")
                postData.verify = "0";
            else if ($("#bremiburse_audit_status").val() === "已审核")
                postData.verify = "1";
            api.reim.getRemi(postData)
                .done(fillRemiTablee)
        }

// 填充报账记录表格
        function fillRemiTablee(data) {
            if (data.status === 0) {
                let data_arr = data.data;
                let tableData = [];

                for (let i = 0; i < data_arr.length; i++) {
                    let tableRow = {
                        purchaseId: data_arr[i].purchase_id,
                        remibTime: data_arr[i].remib_time,
                        purTname: data_arr[i].pur_tname,
                        clazz: data_arr[i].clazz,
                        remibNum: data_arr[i].remib_num,
                        purTime: data_arr[i].pur_time,
                        remibVertify: data_arr[i].remib_vertify === false ? "待审核" : "已审核",
                        remibVerbTname: data_arr[i].remib_vert_tname === null ? "" : data_arr[i].remib_vert_tname,
                        remibRemark: data_arr[i].remib_remark === null ? '' : data_arr[i].remib_remark,
                        id: data_arr[i].id
                    };
                    tableData.push(tableRow);
                }

                // console.log(tableData);
                $("#badminTbody").bootstrapTable("destroy").bootstrapTable({
                    pagination: false,
                    data: tableData,
                    fixedColumns: true,
                    fixedNumber: 4,
                    onCheck: function (row) {
                        selectedRemi.push(row.id);
                        // console.log(selectedRemi);
                    },
                    onUncheck: function (row) {
                        _.pull(selectedRemi, row.id);
                        // console.log(selectedRemi);
                    },
                    onCheckAll: function () {
                        let allData = tableData;
                        selectedRemi = [];
                        for (let i = 0; i < allData.length; i++) {
                            selectedRemi.push(allData[i].id);
                        }
                        // console.log(selectedRemi);
                        1
                    },
                    onUncheckAll: function () {
                        selectedRemi = [];
                        // console.log(selectedRemi);

                    },
                    columns: [
                        {
                            checkbox: true,
                        }
                    ]

                })
                // 分页初始化
                new CutPage('badminTbody', pageSize);
            }
        }

// 生成报账单
        $('#export-remi').click(exportRemi);

        function exportRemi() {
            // console.log(selectedRemi)
            let postdata = {};
            postdata.reimIds = selectedRemi;
            api.reim.downloadReims(postdata)
                .done(function (data) {

                })
        }

// 导出报账excel
        $('#reim-export-excel').click(reimExportExcel);

        function reimExportExcel() {
            let postdata = {};
            postdata.reimIds = selectedRemi;
            api.reim.reimExportExcel(postdata)
                .done(function (data) {

                })
        }

// 新增报账记录
        $('#add-one-remiburse').click(addOneRemiburse);

        function addOneRemiburse() {
            let newRemiburse = {};
            newRemiburse.purchaseId = $("#add_remiburse_num").val();
            newRemiburse.num = parseInt($("#add_remiburse_number").val());
            newRemiburse.remark = $("#add_remiburse_note").val();
            api.reim.addRemi(newRemiburse)
                .done(function (data) {
                    $("#add_remiburse_num").val("");
                    $("#add_remiburse_number").val("");
                    $("#add_remiburse_note").val("");
                    if (data.status === 0) {
                        swal(
                            '添加报账成功',
                            '添加报账成功',
                            'success'
                        );
                        init_data();
                    } else {
                        swal(
                            '报账失败',
                            data.message,
                            'error'
                        );
                    }
                })
        }

// 根据条件查询报账记录（审核部分）
        $('#get-remi-verify').click(getRemiVerify);

        function getRemiVerify() {
            let postData = {};
            postData.clazz = $('#hmaterial').val() === "物料种类" || $('#hmaterial').val() === "暂无选项" ? "%" : $('#hmaterial').val();
            postData.begin = $('#hstart_time').val() === "" ? "1999-10-10" : $('#hstart_time').val();
            postData.end = $('#hend_time').val() === "" ? "2999-10-10" : $('#hend_time').val();
            postData.tname = "%";
            postData.purchaseId = $("#hpurchase_number").val() === "" ? "%" : $("#hpurchase_number").val();
            if ($("#hremiburse_audit_status").val() === "审核状态")
                postData.verify = "%";
            else if ($("#hremiburse_audit_status").val() === "待审核")
                postData.verify = "0";
            else if ($("#hremiburse_audit_status").val() === "已审核")
                postData.verify = "1";
            api.reim.getRemi(postData)
                .done(fillRemiTableVerify)

        }

// 填充报账记录表格（审核）
        function fillRemiTableVerify(data) {
            let data_arr = data.data;
            let tableBody = $('#hadminTbody').empty();
            for (let i = 0; i < data_arr.length; i++) {
                if (data_arr[i].remib_remark === null)
                    data_arr[i].remib_remark = '';
                if (data_arr[i].remib_vertify === true)
                    data_arr[i].vertify = "已审核";
                else if (data_arr[i].remib_vertify === false)
                    data_arr[i].vertify = "待审核";
                let tr = $('<tr></tr>');
                $('<td></td>').text(data_arr[i].purchase_id).appendTo(tr);
                $('<td></td>').text(data_arr[i].remib_time).appendTo(tr);
                $('<td></td>').text(data_arr[i].pur_tname).appendTo(tr);
                $('<td></td>').text(data_arr[i].clazz).appendTo(tr);
                $('<td  class="input_td"><div class="modify' + data_arr[i].id + '">' + data_arr[i].remib_num + '</div><input type="number" class="modifyInput' + data_arr[i].id + ' form-control" value="' + data_arr[i].remib_num + '" id="modifyNum' + data_arr[i].id + '"></td>').appendTo(tr);
                $('<td  class="input_td">' + data_arr[i].vertify + '</td><td>' + data_arr[i].remib_remark + '</td>').appendTo(tr);
                let checkImage = $('<img class="row-image col-sm-4 col-xs-4" src="../../icon/check.svg" id="verify' + data_arr[i].id + '">').click(function () {
                    verifyOneRemi(this);
                });
                let editImage = $('<img src="../../icon/edit.svg" class="row-image col-sm-4 col-xs-4" id="modify' + data_arr[i].id + '">').click(function () {
                    modifyOneRemi(this);
                });
                let deleteImage = $('<img src="../icon/delete.svg" class="row-image col-sm-4 col-xs-4" id="delete' + data_arr[i].id + '"> ').click(function () {
                    deleteOneRemi(this);
                });
                let row = $('<div class="row"></div>').append(checkImage).append(editImage).append(deleteImage);
                $('<td></td>').append(row).appendTo(tr);

                tableBody.append(tr);
            }
            // 分页初始化
            new CutPage('h-admin-table', pageSize);
        }

// 删除报账记录
        function deleteOneRemi(data) {
            swal({
                title: "真的删除该记录吗？",
                type: "info",
                showCancelButton: true,
                confirmButtonText: "确认",
                cancelButtonText: "取消"
            }).then(function (isConfirm) {
                if (isConfirm.value) {
                    let id = data.id.substring(6, data.id.length)
                    let ids = [].concat(id)
                    api.reim.deleteRemi(ids)
                        .done(function (data) {
                            if (data.status === 0) {
                                swal({
                                    title: "删除成功!",
                                    type: "success"
                                }).then(function () {
                                    init_data()
                                })

                            } else {
                                swal({
                                    title: "删除失败!",
                                    type: "error"
                                })
                            }

                        })
                } else {
                    swal({
                        title: "已取消",
                        type: "error"
                    })
                }
            })


        }

// 修改报账记录
        function modifyOneRemi(data) {
            let id = data.id.substring(6, data.id.length)
            $(".modify" + id).hide();
            $(".modifyInput" + id).show();
            $("#options" + id).html(optionsForPurchaserText)

            for (let i = 0; i < optionsForPurchaser.length; i++) {
                if ($("#" + data.id).hasClass(optionsForPurchaser[i])) {
                    $("#options" + id).val(optionsForPurchaser[i])
                    break;
                }
            }
        }

// 确认修改报账记录
        function verifyOneRemi(data) {
            let id = data.id.substring(6, data.id.length);
            let postdata = {};
            postdata.id = id;
            postdata.num = $("#modifyNum" + id).val();
            postdata.tname = tname;
            console.log(basicInfo)
            console.log(postdata)
            api.reim.remiVerify(postdata)
                .done(function (data) {
                    if (data.status === 0) {
                        swal(
                            '审核成功',
                            '审核报账记录成功',
                            'success'
                        );
                        init_data()
                    } else {
                        swal(
                            '审核失败',
                            data.message,
                            'error'
                        )
                    }
                })

        }

// 物料入库页
// 查询入库记录
        $('#get-save-by-5').click(getSaveBy5);

        function getSaveBy5() {
            let postData = {};
            postData.clazz = $('#rmaterial').val() === "物料种类" || $('#rmaterial').val() === "暂无选项" ? "%" : $('#rmaterial').val();
            postData.begin = $('#rstart_time').val() === "" ? "1999-10-10" : $('#rstart_time').val();
            postData.end = $('#rend_time').val() === "" ? "2999-10-10" : $('#rend_time').val();
            postData.pid = $("#rpurchase_number").val() === "" ? "%" : $("#rpurchase_number").val();
            postData.tname = $("#rstore_person").val() === "入库人" || $("#rstore_person").val() === "暂无选项" ? "%" : $("#rstore_person").val();
            api.save.getSaveBy5(postData)
                .done(fillSaveTable)
        }

// 填充入库记录表格
        function fillSaveTable(data) {
            if (data.status === 0) {
                let data_arr = data.data;
                let tableData = [];

                for (let i = 0; i < data_arr.length; i++) {
                    let tableRow = {
                        purchaseId: data_arr[i].purchase_id,
                        saveTime: data_arr[i].save_time,
                        clazz: data_arr[i].clazz,
                        saveNum: data_arr[i].save_num,
                        saveTname: data_arr[i].save_tname,
                        saveRemark: data_arr[i].save_remark === null ? '' : data_arr[i].save_remark,
                        id: data_arr[i].id
                    };
                    tableData.push(tableRow);

                }

                $("#radminTbody").bootstrapTable("destroy").bootstrapTable({
                    pagination: false,
                    data: tableData,
                    fixedColumns: true,
                    fixedNumber: 4,
                });
                // 分页初始化
                new CutPage('radminTbody', pageSize);
            }
        }

// 新增入库记录
        $('#add-one-store').click(function () {
            let newStore = {};
            newStore.pid = $("#add_store_num").val();
            newStore.time = $("#add_store_date").val();
            newStore.num = $("#add_store_number").val();
            newStore.remark = $("#add_store_note").val();
            newStore.tname = tname;
            api.save.addSave(newStore)
                .done(function (data) {
                    $("#add_store_num").val("");
                    $("#add_store_date").val("");
                    $("#add_store_number").val("");
                    $("#add_store_note").val("");
                    if (data.status === 0) {
                        swal(
                            '添加成功',
                            '新增入库记录成功',
                            'success'
                        );
                        init_data();
                    } else {
                        swal(
                            '添加失败',
                            '新增入库记录失败，请重试！',
                            'error'
                        );
                    }
                })
        });
    });
});