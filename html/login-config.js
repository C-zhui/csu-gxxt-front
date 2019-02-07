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

require(['spec/login'],function(){
    console.log('加载login.js成功')
})