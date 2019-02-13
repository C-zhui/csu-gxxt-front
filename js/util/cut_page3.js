/**
 * 分页函数
 * pname--分页的表格前缀
 * pno--页数
 * psize--每页显示记录数
 * 分页部分是从真实数据行开始，因而存在加减某个常数，以确定真正的记录数
 * 纯js分页实质是数据行全部加载，通过是否显示属性完成分页功能
 **/
function CutPage(tableID, psize) {
    this.tableID=tableID;
    this.pageSize=psize;
    this.currentPage=1;
    this.totalPage=null;
    this.totalRows=$('#'+tableID+' tbody tr').length;
    if(this.totalRows/this.pageSize>parseInt(this.totalRows/this.pageSize)){
        this.totalPage=parseInt(this.totalRows/this.pageSize)+1;
    }else{
        this.totalPage=parseInt(this.totalRows/this.pageSize)+1;
    }

    html = '<div class="barcon clearfix" id="' + tableID + 'barcon">' +
        '<div id="'+tableID+'barcon1" class="barcon1"></div>' +
        '<div class="barcon2">' +
        '<ul>' +
        '<li>' +
        '<a href="###" id="' + tableID + 'firstPage" class="btn btn-sm btn-outline">首页</a></li>' +
        '<li>' +
        '<a href="###" id="' + tableID + 'prePage" class="btn btn-sm btn-outline">上一页</a></li>' +
        '<li>\n' +
        '<a href="###" id="' + tableID + 'nextPage" class="btn btn-sm btn-outline">下一页</a></li>' +
        '<li>' +
        '<a href="###" id="' + tableID + 'lastPage" class="btn btn-sm btn-outline">尾页</a></li>' +
        '<li>' +
        '<input type="text" id="'+tableID+'jumpWhere" class="jumpWhere">' +
        '</li>' +
        '<li><a href="###" id="' + tableID + 'jumpPage" class="btn btn-sm btn-outline">跳转</a></li>' +
        '</ul>' +
        '</div>' +
        '</div>';
    let table=$('#'+tableID);
    if ($('#' + this.tableID + 'barcon').length < 1) {
        table.after(html);
    }
    $('#'+this.tableID+'jumpPage').click(this.lazyJumpPage(this));
    this.goPage(1);
}

CutPage.prototype.goPage = function (targetPage, offset = null) {
    if(offset!==null){
        targetPage=this.currentPage+offset;
    }
    this.currentPage=targetPage;

    let tempStr = "共"+this.totalRows+"条记录 | 分"+this.totalPage+"页 | 当前第"+targetPage+"页";
    // ================================================= barcon1 部分
    $('#'+this.tableID+'barcon1').html(tempStr);

    $("#"+this.tableID+"jumpWhere").val(targetPage);       // 设置“跳转”按钮的值

    //设置点击事件
    if(this.currentPage>1){
        $("#"+this.tableID+"firstPage").on("click",this.lazyGoPage(this,1)).removeClass("ban");
        $("#"+this.tableID+"prePage").on("click",this.lazyGoPage(this,null,-1)).removeClass("ban");
    }else{
        $("#"+this.tableID+"firstPage").off("click").addClass("ban");
        $("#"+this.tableID+"prePage").off("click").addClass("ban");
    }

    if(this.currentPage<this.totalPage){
        $("#"+this.tableID+"nextPage").on("click",this.lazyGoPage(this,null,1)).removeClass("ban");
        $("#"+this.tableID+"lastPage").on("click",this.lazyGoPage(this,this.totalPage)).removeClass("ban")
    }else{
        $("#"+this.tableID+"nextPage").off("click").addClass("ban");    // 添加 ban class属性，用于设置透明度，不可点击等
        $("#"+this.tableID+"lastPage").off("click").addClass("ban");
    }

    let startRow = (targetPage - 1) * this.pageSize+1;
    let endRow = targetPage * this.pageSize;
    endRow = (endRow > this.totalRows)? this.totalRows : endRow;
    let tableTr=$('#'+this.tableID+' tbody tr');
    tableTr.hide();
    for(var i=startRow-1;i<endRow;i++){
        // ================================================= tbody 部分
        tableTr.eq(i).show();
    }
};
CutPage.prototype.lazyGoPage = function (obj, targetPage, offset) {
    return function () {
        obj.goPage(targetPage,offset);
    }
};
CutPage.prototype.jumpPage = function () {
    let page=parseInt($('#'+this.tableID+'jumpWhere').val());
    if(page!==this.currentPage){
        this.goPage(page);
    }
};
CutPage.prototype.lazyJumpPage = function (obj) {
    return function () {
        obj.jumpPage();
    }
};



// var pageSize=0;		//每页显示行数
// var currentPage_=1;	//当前页全局变量，用于跳转时判断是否在相同页，在就不跳，否则跳转。
// var totalPage;		//总页数
//
// function goPage(pname,pno,psize){
//     // ================================================= tbody 部分
//     var itable = document.getElementById(pname+"adminTbody");
//     var num = itable.rows.length;	//未分页表格数据所有行数(所有记录数)
//
//     pageSize = psize;				//每页显示行数
//
//     //总共分几页
//     if(num/pageSize > parseInt(num/pageSize)){
//         totalPage=parseInt(num/pageSize)+1;
//     }else{
//         totalPage=parseInt(num/pageSize);
//     }
//     var currentPage = pno;	//当前页数
//     currentPage_=currentPage;
//     var startRow = (currentPage - 1) * pageSize+1;
//     var endRow = currentPage * pageSize;
//     endRow = (endRow > num)? num : endRow;
//     //遍历显示数据实现分页
//     /*for(var i=1;i<(num+1);i++){
//         var irow = itable.rows[i-1];
//         if(i>=startRow && i<=endRow){
//             irow.style.display = "";
//         }else{
//             irow.style.display = "none";
//         }
//     }*/
//
//     // ================================================= tbody 部分
//     $("#"+pname+"adminTbody tr").hide();
//     // console.log(startRow);
//     // console.log(endRow);
//     for(var i=startRow-1;i<endRow;i++){
//         // ================================================= tbody 部分
//         $("#"+pname+"adminTbody tr").eq(i).show();
//     }
//     var tempStr = "共"+num+"条记录 | 分"+totalPage+"页 | 当前第"+currentPage+"页";
//     // ================================================= barcon1 部分
//     document.getElementById(pname+"barcon1").innerHTML = tempStr;
//     if(currentPage>1){
//         $("#"+pname+"firstPage").on("click",function(){
//             goPage(pname,1,psize);
//         }).removeClass("ban");
//         $("#"+pname+"prePage").on("click",function(){
//             goPage(pname,currentPage-1,psize);
//         }).removeClass("ban");
//     }else{
//         $("#"+pname+"firstPage").off("click").addClass("ban");
//         $("#"+pname+"prePage").off("click").addClass("ban");
//     }
//
//     if(currentPage<totalPage){
//         $("#"+pname+"nextPage").on("click",function(){
//             goPage(pname,currentPage+1,psize);
//         }).removeClass("ban")
//         $("#"+pname+"lastPage").on("click",function(){
//             goPage(pname,totalPage,psize);
//         }).removeClass("ban")
//     }else{
//         $("#"+pname+"nextPage").off("click").addClass("ban");    // 添加 ban class属性，用于设置透明度，不可点击等
//         $("#"+pname+"lastPage").off("click").addClass("ban");
//     }
//
//     $("#"+pname+"jumpWhere").val(currentPage);       // 设置“跳转”按钮的值
// }
//
// function jumpPage(pname){
//     console.log(pname);
//     var num=parseInt($("#"+pname+"jumpWhere").val());
//     if(num!=currentPage_)
//     {
//         goPage(pname,num,pageSize);
//     }
// }
//
// // bootstrapTable 的分页
// function goPageBT(pname,pno,psize) {
// // ================================================= tbody 部分
//     var itable = document.getElementById(pname+"adminTbody").getElementsByTagName("tbody")[0];
//     var num = itable.rows.length;	//未分页表格数据所有行数(所有记录数)
//
//     pageSize = psize;				//每页显示行数
//
//     //总共分几页
//     if(num/pageSize > parseInt(num/pageSize)){
//         totalPage=parseInt(num/pageSize)+1;
//     }else{
//         totalPage=parseInt(num/pageSize);
//     }
//     var currentPage = pno;	//当前页数
//     currentPage_=currentPage;
//     var startRow = (currentPage - 1) * pageSize+1;
//     var endRow = currentPage * pageSize;
//     endRow = (endRow > num)? num : endRow;
//     //遍历显示数据实现分页
//     /*for(var i=1;i<(num+1);i++){
//         var irow = itable.rows[i-1];
//         if(i>=startRow && i<=endRow){
//             irow.style.display = "";
//         }else{
//             irow.style.display = "none";
//         }
//     }*/
//
//     // ================================================= tbody 部分
//     $("#"+pname+"adminTbody tr").hide();
//     // console.log(startRow);
//     // console.log(endRow);
//     // 显示表头************很重要*********
//     $("#"+pname+"adminTbody thead tr").show()
//     for(var i=startRow-1;i<endRow;i++){
//         // ================================================= tbody 部分
//         $("#"+pname+"adminTbody tbody tr").eq(i).show();
//     }
//     var tempStr = "共"+num+"条记录 | 分"+totalPage+"页 | 当前第"+currentPage+"页";
//     // ================================================= barcon1 部分
//     document.getElementById(pname+"barcon1").innerHTML = tempStr;
//
//     if(currentPage>1){
//         $("#"+pname+"firstPage").on("click",function(){
//             goPageBT(pname,1,psize);
//         }).removeClass("ban");
//         $("#"+pname+"prePage").on("click",function(){
//             goPageBT(pname,currentPage-1,psize);
//         }).removeClass("ban");
//     }else{
//         $("#"+pname+"firstPage").off("click").addClass("ban");
//         $("#"+pname+"prePage").off("click").addClass("ban");
//     }
//
//     if(currentPage<totalPage){
//         $("#"+pname+"nextPage").on("click",function(){
//             goPageBT(pname,currentPage+1,psize);
//         }).removeClass("ban")
//         $("#"+pname+"lastPage").on("click",function(){
//             goPageBT(pname,totalPage,psize);
//         }).removeClass("ban")
//     }else{
//         $("#"+pname+"nextPage").off("click").addClass("ban");    // 添加 ban class属性，用于设置透明度，不可点击等
//         $("#"+pname+"lastPage").off("click").addClass("ban");
//     }
//
//     $("#"+pname+"jumpWhere").val(currentPage);       // 设置“跳转”按钮的值
// }
//
// function jumpPageBT(pname) {
//     var num=parseInt($("#"+pname+"jumpWhere").val());
//     if(num!=currentPage_)
//     {
//         goPageBT(pname,num,pageSize);
//     }
// }
