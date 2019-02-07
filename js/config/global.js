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

        downloads: function (url, json_obj) {
            $.ajax({
                type: 'post',
                url: this.base_url + url,
                datatype: 'json',
                data: json_obj,
                crossDomain: true,
                success: function (result) {
                    // 创建a标签，设置属性，并触发点击下载
                    var $a = $("<a>");
                    $a.attr("href", result.data.file);
                    $a.attr("download", result.data.filename);
                    $("body").append($a);
                    $a[0].click();
                    $a.remove();
                }
            });
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