
define(['api/apiobj','config/global'], function (api,g) {
    api.experiment = {
        //添加模板
        addTemplate: function (data) {
            return g.post_json(
                '/experiment/addTemplate',
                data
            )
        },
        // 修改模板
        modifyTemplate: function (data) {
            return g.post_json(
                '/experiment/modifyTemplate',
                data
            )
        },
        // 获取所有模版名
        getAllTemplates: function () {
            return g.post_query(
                '/experiment/getAllTemplate',
                {}
            )
        },
        // 获取模板数据
        getTemplate: function (template_id) {
            var data = { template_id: template_id };
            return g.post_query(
                '/experiment/getTemplate',
                data
            )
        },
        // 删除模板
        deleteTemplate: function (template_id) {
            var data = { template_id: template_id }
            return g.post_query(
                '/experiment/deleteTemplate',
                data
            )
        },
        //绑定模板
        bundleTemplateRequest: function (batch_name, template_id) {
            var data = {
                'batch_name': batch_name,
                'template_id': template_id
            }
            return g.post_query(
                '/experiment/bundleTemplate',
                data
            )
        },
        // 通过批次获取
        getExperimentByBatch: function (batch_name) {
            return g.post_query(
                '/experiment/getExperimentByBatch',
                { batch_name: batch_name }
            )
        },
        getExperimentByBatchAndProced: function (batch_name, pro_name) {
            return g.post_query(
                '/experiment/getExperimentByProAndBatch',
                {
                    batch_name: batch_name,
                    pro_name: pro_name
                }
            )
        },
        updateExperiment: function (data) {
            return g.post_json(
                '/experiment/updateExperiment',
                data
            )
        },
        getClass: function (sid) {
            return g.post_query(
                '/experiment/getClass',
                { sid: sid }
            )
        },
        send_download_excel: function (data) { // data 是 二维的字符串数组
            var xhr = new XMLHttpRequest();
            xhr.open('POST', base_url + '/experiment/ExcelDownload', true);        // 也可以使用POST方式，根据接口
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
                        a.download = 'data' + (Math.random() * 100000).toFixed(0) + '.xlsx';
                        a.href = e.target.result;
                        $("body").append(a);    // 修复firefox中无法触发click
                        a.click();
                        $(a).remove();
                    }
                }
            };
            // 发送ajax请求
            xhr.send(JSON.stringify(data))
        }
    }
})