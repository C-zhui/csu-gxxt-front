# 说明

## api 
用于组织api的文件夹，使用require来管理依赖，挂载需要使用的api

## config
用于配置，估计用的不多，配置什么来着……base_url

## lib
放jquery、bootstrap、lodash等等的工具库

## spec
子页面的js，在这些代码文件的开头，使用`require([deps],function(...){})`来加载依赖项使用。

``` js
// 加载jquery、api对象、lodash工具、挂载api-experiment到api对象
require(['jquery','api/apiobj','lodash','api/experiment',],function($,apiobj,_){
    $('div#id').dosomething
    apiobj.api().done().fail(net_err)
    _.map(data,function(v){
        ...
    })
})
```


## util 
工具库