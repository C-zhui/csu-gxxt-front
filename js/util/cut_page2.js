/**
 * 分页函数
 * pname--分页的表格前缀
 * pno--页数
 * psize--每页显示记录数
 * 分页部分是从真实数据行开始，因而存在加减某个常数，以确定真正的记录数
 * 纯js分页实质是数据行全部加载，通过是否显示属性完成分页功能
 **/

var pageSize=0;		//每页显示行数
var currentPage_=1;	//当前页全局变量，用于跳转时判断是否在相同页，在就不跳，否则跳转。
var totalPage;		//总页数

function goPage(pname,pno,psize){
    // ================================================= tbody 部分
    var itable = document.getElementById(pname+"adminTbody");
    var num = itable.rows.length;	//未分页表格数据所有行数(所有记录数)

    pageSize = psize;				//每页显示行数

    //总共分几页
    if(num/pageSize > parseInt(num/pageSize)){
        totalPage=parseInt(num/pageSize)+1;
    }else{
        totalPage=parseInt(num/pageSize);
    }
    var currentPage = pno;	//当前页数
    currentPage_=currentPage;
    var startRow = (currentPage - 1) * pageSize+1;
    var endRow = currentPage * pageSize;
    endRow = (endRow > num)? num : endRow;
    //遍历显示数据实现分页
    /*for(var i=1;i<(num+1);i++){
        var irow = itable.rows[i-1];
        if(i>=startRow && i<=endRow){
            irow.style.display = "";
        }else{
            irow.style.display = "none";
        }
    }*/

    // ================================================= tbody 部分
    $("#"+pname+"adminTbody tr").hide();
    // console.log(startRow);
    // console.log(endRow);
    for(var i=startRow-1;i<endRow;i++){
        // ================================================= tbody 部分
        $("#"+pname+"adminTbody tr").eq(i).show();
    }
    var tempStr = "共"+num+"条记录 | 分"+totalPage+"页 | 当前第"+currentPage+"页";
    // ================================================= barcon1 部分
    document.getElementById(pname+"barcon1").innerHTML = tempStr;

    if(currentPage>1){
        $("#"+pname+"firstPage").on("click",function(){
            goPage(pname,1,psize);
        }).removeClass("ban");
        $("#"+pname+"prePage").on("click",function(){
            goPage(pname,currentPage-1,psize);
        }).removeClass("ban");
    }else{
        $("#"+pname+"firstPage").off("click").addClass("ban");
        $("#"+pname+"prePage").off("click").addClass("ban");
    }

    if(currentPage<totalPage){
        $("#"+pname+"nextPage").on("click",function(){
            goPage(pname,currentPage+1,psize);
        }).removeClass("ban")
        $("#"+pname+"lastPage").on("click",function(){
            goPage(pname,totalPage,psize);
        }).removeClass("ban")
    }else{
        $("#"+pname+"nextPage").off("click").addClass("ban");    // 添加 ban class属性，用于设置透明度，不可点击等
        $("#"+pname+"lastPage").off("click").addClass("ban");
    }

    $("#"+pname+"jumpWhere").val(currentPage);       // 设置“跳转”按钮的值
}

function jumpPage(pname){
    console.log(pname);
    var num=parseInt($("#"+pname+"jumpWhere").val());
    if(num!=currentPage_)
    {
        goPage(pname,num,pageSize);
    }
}

// bootstrapTable 的分页
function goPageBT(pname,pno,psize) {
// ================================================= tbody 部分
    var itable = document.getElementById(pname+"adminTbody").getElementsByTagName("tbody")[0];
    var num = itable.rows.length;	//未分页表格数据所有行数(所有记录数)

    pageSize = psize;				//每页显示行数

    //总共分几页
    if(num/pageSize > parseInt(num/pageSize)){
        totalPage=parseInt(num/pageSize)+1;
    }else{
        totalPage=parseInt(num/pageSize);
    }
    var currentPage = pno;	//当前页数
    currentPage_=currentPage;
    var startRow = (currentPage - 1) * pageSize+1;
    var endRow = currentPage * pageSize;
    endRow = (endRow > num)? num : endRow;
    //遍历显示数据实现分页
    /*for(var i=1;i<(num+1);i++){
        var irow = itable.rows[i-1];
        if(i>=startRow && i<=endRow){
            irow.style.display = "";
        }else{
            irow.style.display = "none";
        }
    }*/

    // ================================================= tbody 部分
    $("#"+pname+"adminTbody tr").hide();
    // console.log(startRow);
    // console.log(endRow);
    // 显示表头************很重要*********
    $("#"+pname+"adminTbody thead tr").show()
    for(var i=startRow-1;i<endRow;i++){
        // ================================================= tbody 部分
        $("#"+pname+"adminTbody tbody tr").eq(i).show();
    }
    var tempStr = "共"+num+"条记录 | 分"+totalPage+"页 | 当前第"+currentPage+"页";
    // ================================================= barcon1 部分
    document.getElementById(pname+"barcon1").innerHTML = tempStr;

    if(currentPage>1){
        $("#"+pname+"firstPage").on("click",function(){
            goPageBT(pname,1,psize);
        }).removeClass("ban");
        $("#"+pname+"prePage").on("click",function(){
            goPageBT(pname,currentPage-1,psize);
        }).removeClass("ban");
    }else{
        $("#"+pname+"firstPage").off("click").addClass("ban");
        $("#"+pname+"prePage").off("click").addClass("ban");
    }

    if(currentPage<totalPage){
        $("#"+pname+"nextPage").on("click",function(){
            goPageBT(pname,currentPage+1,psize);
        }).removeClass("ban")
        $("#"+pname+"lastPage").on("click",function(){
            goPageBT(pname,totalPage,psize);
        }).removeClass("ban")
    }else{
        $("#"+pname+"nextPage").off("click").addClass("ban");    // 添加 ban class属性，用于设置透明度，不可点击等
        $("#"+pname+"lastPage").off("click").addClass("ban");
    }

    $("#"+pname+"jumpWhere").val(currentPage);       // 设置“跳转”按钮的值
}

function jumpPageBT(pname) {
    var num=parseInt($("#"+pname+"jumpWhere").val());
    if(num!=currentPage_)
    {
        goPageBT(pname,num,pageSize);
    }
}
