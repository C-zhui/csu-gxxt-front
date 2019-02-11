// function load(jqueryObj, url) {
//     console.log(url)
//     jqueryObj.load(url, function (result) {
//         var $result = $(result);
//         $result.find("script").appendTo(jqueryObj);
//     });
// }

define(['jquery', 'swal', 'lodash', 'spec/set-height'], function ($, swal, _, setHeight) {
    role_to_nav = {
        'admin': 'manager-nav.json',
        'teacher': 'teacher-nav.json',
        'student': 'student-nav.json'
    }

    role_to_end = {
        'admin': '管理员',
        'teacher': '教师',
        'student': '学生'
    }

    $("#content_body").bind('resize', function(e) {
        setHeight()
    });

    var role = window.location.search || '';
    role = role.slice(1);
    // console.log(role)

    if (!role_to_nav[role]) // 身份不对，回去登录
        window.location.href = './login.html'


    $(function () {
        var navi = $('#navigation');
        navi.on('click', 'a', function (event) {

            event.preventDefault();
            var a = $(this)
            $('#working-space').load(a.attr('href'), function (data, status) {
                if (status !== 'success') {
                    swal('错误',
                        '加载页面' + a.attr('href') + '失败',
                        'error'
                    );
                    return;
                }
                $('.active', navi).removeClass('active')
                a.parent().addClass('active')
                var part = a.text();
                var category = a.parents('.category').find('.category-name').text();
                // console.log(part, category);
                $('#category', navi).text(category);
                $('#part', navi).text(part)
            });
        })
    });

    $.ajaxSetup({
        cache: false,
        crossDomain: true
    });

    $.getJSON(role_to_nav[role], function (data) {
        // console.log(data);
        $('#end').text(role_to_end[role]);
        $('#category').empty();
        $('#part').empty();


        var $nav_container = $('#navigation-container').empty();
        _.each(data, function (category, i) { // 每个选项组
            var $category_li = $('<li></li>').addClass('category');
            $("<img></img>").addClass('icon').attr('src', category.icon).appendTo($category_li);
            $('<span></span>').addClass('category-name').text(category.category).appendTo($category_li);

            var $items = $('<ul></ul>');
            _.each(category.items, function (item) {
                var $item = $('<li></li>');
                $('<a></a>').attr('href', item.url).text(item.name).appendTo($item)
                $item.appendTo($items)
            });
            $items.appendTo($category_li);
            $category_li.appendTo($nav_container);
        });
    });



})