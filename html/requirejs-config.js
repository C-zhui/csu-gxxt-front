require.config({
    baseUrl:'../js/',
    paths:{
        jquery:'lib/jquery',
        bootstrap:'lib/bootstrap',
        "popper":'https://cdn.bootcss.com/popper.js/1.12.9/umd/popper.min'
    }
})

require(['api/apiobj','api/student','api/material'],function(apiobj){
    console.log(apiobj)
})

require(['jquery','bootstrap'],function($){
    $(function(){
        console.log('加载jquery及bootstrap')
    })
})

require(['test2.js'],function(t){
    console.log('test2.js执行结果',t)
})