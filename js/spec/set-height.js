// 调整左边导航栏的长度
define(['jquery','util/resize'],function($){
    return function setHeight() {
        setTimeout(function()
        {
            var heightContent = $("#content_body").height();
            if(heightContent>800){
                heightContent=heightContent+20;
            }
            $("#nav_main").animate({height:heightContent-70+"px"});
            // $("#nav_main").css("height", heightContent-70)
        }, 1000);
    }
})
