require.config({
    baseUrl:'../js/',
    paths:{
        jquery:'lib/jquery.min',
        bootstrap:'lib/bootstrap.min',
        popper:'lib/popper.min',
        lodash:'lib/lodash.min',
        flatpickr:'lib/flatpickr.min',
        swal:'lib/sweetalert.min',
        moment:'lib/moment.min',
        bootstrapTable:'lib/bootstrap-table.min',
        bootstrapTableFixedColumns:'lib/bootstrap-table-fixed-columns'
    }
})

// 加载全局库、启动导航
require(['jquery','bootstrap','spec/boot-navigation','spec/logout'],function($){
    $(function(){
        console.log('加载jquery及bootstrap');
    });
});