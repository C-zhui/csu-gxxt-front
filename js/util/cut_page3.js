define(['jquery'], function ($) {
    /**
     * 分页类
     * tableID--表格id
     * pageSize--分页每页行数
     * 纯js分页实质是数据行全部加载，通过是否显示属性完成分页功能
     **/
    function CutPage(tableID, pageSize) {
        this.tableID = tableID;
        this.pageSize = pageSize;
        this.currentPage = 1;
        this.totalPage = null;
        this.totalRows = $('#' + tableID + ' tbody tr').length;
        if (this.totalRows / this.pageSize > parseInt(this.totalRows / this.pageSize)) {
            this.totalPage = parseInt(this.totalRows / this.pageSize) + 1;
        } else {
            this.totalPage = parseInt(this.totalRows / this.pageSize) + 1;
        }

        let table = $('#' + tableID);
        table.wrap('<div class="table-responsive" id="' + tableID + 'table-responsive"></div>');

        html = '<div class="barcon clearfix" id="' + tableID + 'barcon">' +
            '<div id="' + tableID + 'barcon1" class="barcon1"></div>' +
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
            '<input type="text" id="' + tableID + 'jumpWhere" class="jumpWhere">' +
            '</li>' +
            '<li><a href="###" id="' + tableID + 'jumpPage" class="btn btn-sm btn-outline">跳转</a></li>' +
            '</ul>' +
            '</div>' +
            '</div>';
        if ($('#' + this.tableID + 'barcon').length < 1) {
            $('#' + tableID + 'table-responsive').after(html);
        }
        $('#' + this.tableID + 'jumpPage').click(this.lazyJumpPage(this));
        this.goPage(1);
    }

    CutPage.prototype.goPage = function (targetPage, offset = null) {
        if (offset !== null) {
            targetPage = this.currentPage + offset;
        }
        this.currentPage = targetPage;

        let tempStr = "共" + this.totalRows + "条记录 | 分" + this.totalPage + "页 | 当前第" + targetPage + "页";
        // ================================================= barcon1 部分
        $('#' + this.tableID + 'barcon1').html(tempStr);

        $("#" + this.tableID + "jumpWhere").val(targetPage);       // 设置“跳转”按钮的值

        //设置点击事件
        if (this.currentPage > 1) {
            $("#" + this.tableID + "firstPage").off('click').on("click", this.lazyGoPage(this, 1)).removeClass("ban");
            $("#" + this.tableID + "prePage").off('click').on("click", this.lazyGoPage(this, null, -1)).removeClass("ban");
        } else {
            $("#" + this.tableID + "firstPage").off("click").addClass("ban");
            $("#" + this.tableID + "prePage").off("click").addClass("ban");
        }

        if (this.currentPage < this.totalPage) {
            $("#" + this.tableID + "nextPage").off('click').on("click", this.lazyGoPage(this, null, 1)).removeClass("ban");
            $("#" + this.tableID + "lastPage").off('click').on("click", this.lazyGoPage(this, this.totalPage)).removeClass("ban")
        } else {
            $("#" + this.tableID + "nextPage").off("click").addClass("ban");    // 添加 ban class属性，用于设置透明度，不可点击等
            $("#" + this.tableID + "lastPage").off("click").addClass("ban");
        }

        let startRow = (targetPage - 1) * this.pageSize + 1;
        let endRow = targetPage * this.pageSize;
        endRow = (endRow > this.totalRows) ? this.totalRows : endRow;
        let tableTr = $('#' + this.tableID + ' tbody tr');
        tableTr.hide();
        for (var i = startRow - 1; i < endRow; i++) {
            // ================================================= tbody 部分
            tableTr.eq(i).show();
        }
    };
    CutPage.prototype.lazyGoPage = function (obj, targetPage, offset) {
        return function () {
            obj.goPage(targetPage, offset);
        }
    };
    CutPage.prototype.jumpPage = function () {
        let page = parseInt($('#' + this.tableID + 'jumpWhere').val());
        if (page !== this.currentPage) {
            this.goPage(page);
        }
    };
    CutPage.prototype.lazyJumpPage = function (obj) {
        return function () {
            obj.jumpPage();
        }
    };
    return {
        cutPage: function (tableID, pageSize) {
            return new CutPage(tableID, pageSize);
        }
    }
});