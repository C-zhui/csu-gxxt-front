require.config({
    baseUrl:'../js/',
    paths:{
        jquery:'lib/jquery',
        bootstrap:'lib/bootstrap',
        popper:'https://cdn.bootcss.com/popper.js/1.12.9/umd/popper.min',
        lodash:'lib/lodash',
        flatpickr:'lib/flatpickr',
        swal:'lib/sweetalert.min'
    }
})

// 加载全局库、启动导航
require(['jquery','bootstrap','lodash','flatpickr','swal','spec/boot-navigation'],function($){
    $(function(){
        console.log('加载jquery及bootstrap')
    })
})



// api 到具体的子页面加载
// require(['api/apiobj','api/student','api/material'],function(apiobj){
    // console.log(apiobj)
// })