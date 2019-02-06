# 说明

## login.html

是登陆页面，登陆成功后，将跳转到index.html

## index.html

登陆之后的操作面板，根据登录之后用户身份的不同，作如下约定:
1. manager-config.json /teacher-config.json /student-config.json 用于配置不同身份的导航栏内容。
2.  登录之后，根据身份，向服务器获取上面的json文件，然后将各自的导航加载到导航栏的列表中。
3.  sub-page文件夹用于存放导航的子页面，这些子页面会被加载到index.html页面的右侧，将使用jqueryObj.load(url) 进行动态加载。
4.  关于这些子页面的说明
    1. 由于子页面是动态加载到index.html中的，代码中的相对路径将以index.html为基准
    2. 子页面的内容不强制有html、body标签，只要是标签就可以。但是head中的内容是无效的，
    3.  基于第2点，作约定：
        1. 子页面的根标签使用div#body
        2. \<style\> 或 \<link \> 在div#body其内开头
        3. script放在最后，并在代码中使用require来管理依赖


## manager-config.json ...
manager-config.json teacher-config.json student-config.json 这三个json文件用于说明不同身份导航的不同内容，以复用html代码。如下：
``` json
{
    "用户管理":{
        "学生管理":"./sub-page/student-manager.html",
        "教师管理":"./sub-page/teacher-manager.html"
    },
    "实习排课":{
        ...
    }
}
```

## require-config.js
用于配置库的路径以及加载全局库，关于require的使用，参考 [requirejs官网](http://www.requirejs.cn/)。


