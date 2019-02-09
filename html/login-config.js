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

require(['spec/login'],function(){
    console.log('加载login.js成功')
})