define(['jquery'], function ($) {
    return {
        base_url: 'http://134.175.152.210:8084',

        post_query: function (url, query) {
            return $.ajax({
                type: 'post',
                url: this.base_url + url,
                dataType: 'json',
                data: query,
                crossDomain: true,
            })
        },

        post_json: function (url, json_obj) {
            return $.ajax({
                type: 'post',
                url: this.base_url + url,
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(json_obj),
                crossDomain: true,
            });
        },

        post_file: function (url, data) {
            return $.ajax({
                type: 'post',
                url: this.base_url + url,
                data: data,
                processData: false,
                contentType: false
            })
        },

        downloads: function (url, req_type, json_obj) {
            var xhr = new XMLHttpRequest();
            xhr.open(req_type, this.base_url + url, true);        // 也可以使用POST方式，根据接口
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
            xhr.send(json_obj)
        },

        net_err: function (data) {
            swal('出错了', '网络错误', 'error')
            console.log(data)
        },

        fetch_err: function (data) {
            swal('请求失败', data.message, 'error')
            console.log(data)
        }
    }
});