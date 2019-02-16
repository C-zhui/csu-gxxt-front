require.config({
    baseUrl:'../js/',
    paths:{
        jquery:'lib/jquery.min',
        bootstrap:'lib/bootstrap.min',
        popper:'lib/popper.min',
        lodash:'lib/lodash.min',
        flatpickr:'lib/flatpickr.min',
        swal:'lib/sweetalert.min'
    }
})

require(['spec/login'],function(){
    console.log('加载login.js成功')
})