require.config({
    baseUrl:'../js/',
    paths:{
        jquery:'lib/jquery',
        bootstrap:'lib/bootstrap',
        popper:'lib/popper.min',
        lodash:'lib/lodash',
        flatpickr:'lib/flatpickr',
        swal:'lib/sweetalert.min'
    }
})

// 加载全局库、启动导航
require(['jquery','bootstrap','spec/boot-navigation','spec/logout'],function($){
    $(function(){
        console.log('加载jquery及bootstrap');
    });
});