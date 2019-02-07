define(['api/apiobj','config/global'],function(api,g){
    api.user = {
        getInfo:function(){
            return g.post_query('/user/getInfo');
        }
    }
})