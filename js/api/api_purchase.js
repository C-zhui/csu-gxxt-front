// 采购
var api_purchase = {
    // 查询采购记录
    getPurchase:function (postdata) {
        return post_query(
            '/purchase/getPurchase',
            postdata
        )
    },
    // 新增一条采购记录
    addPurchase:function (postdata) {
        return post_query(
            '/purchase/add',
            postdata
        )
    },
    // 采购导出excel
    downloadPurchase:function (postdata) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', base_url + '/purchase/downloadPurchase', true);        // 也可以使用POST方式，根据接口
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
                    a.download = '采购单.xls';
                    a.href = e.target.result;
                    $("body").append(a);    // 修复firefox中无法触发click
                    a.click();
                    $(a).remove();
                }
            }
        };
        // 发送ajax请求
        xhr.send(JSON.stringify(postdata.purchase_ids))
    }
}