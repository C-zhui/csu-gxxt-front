// 采购报账
var api_reim = {
    // 查询采购报账记录
    getRemi:function (postdata) {
        return post_json(
            '/reim/getReim',
            postdata
        )
    },
    // 新增报账记录
    addRemi:function (postdata) {
        return post_json(
            '/reim/add',
            postdata
        )
    },
    // 报账单
    downloadReims:function (postdata) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', base_url + '/reim/downloadReim', true);        // 也可以使用POST方式，根据接口
        xhr.responseType = "blob";    // 返回类型blob
        xhr.setRequestHeader("Content-type", "application/json");
        // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
        xhr.onload = function () {
            // 请求完成
            if (this.status === 200) {
                // 返回200
                var blob = this.response;
                var reader = new FileReader();
                reader.readAsDataURL(blob);    // 转换为base64，可以直接放入a表情href
                reader.onload = function (e) {
                    // 转换完成，创建一个a标签用于下载
                    var a = document.createElement('a');
                    a.download = '报账单.xls';
                    a.href = e.target.result;
                    $("body").append(a);    // 修复firefox中无法触发click
                    a.click();
                    $(a).remove();
                }
            }
        };
        // 发送ajax请求
        xhr.send(JSON.stringify(postdata.reimIds))
    },
    // 报账导出excel
    reimExportExcel:function (postdata) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', base_url + '/reim/exportExcel', true);        // 也可以使用POST方式，根据接口
        xhr.responseType = "blob";    // 返回类型blob
        xhr.setRequestHeader("Content-type", "application/json");
        // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
        xhr.onload = function () {
            // 请求完成
            if (this.status === 200) {
                // 返回200
                var blob = this.response;
                var reader = new FileReader();
                reader.readAsDataURL(blob);    // 转换为base64，可以直接放入a表情href
                reader.onload = function (e) {
                    // 转换完成，创建一个a标签用于下载
                    var a = document.createElement('a');
                    a.download = '报账记录Excel.xls';
                    a.href = e.target.result;
                    $("body").append(a);    // 修复firefox中无法触发click
                    a.click();
                    $(a).remove();
                }
            }
        };
        // 发送ajax请求
        xhr.send(JSON.stringify(postdata.reimIds))
    },
    // 删除报账
    deleteRemi:function(ids) {
        console.log(233)
        return post_json(
            '/reim/delete',
            ids
        )
    },
    // 修改报账 接口还有问题**********************************
    remiVerify:function (postdata) {
        return post_query(
            '/reim/verify',
            postdata
        )
    },

}