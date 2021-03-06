var DirectoriesPage = (function () {
    var _this;

    var $path;

    var $dirProjectsTopMenu;//文件顶部菜单
    var $itemTD;            //文件item表格
    var $itemActionBtn;     //文件操作按钮
    var $fileActionsMenu;   //文件操作对话框
    var $fileActionsMenuHeader;   //文件操作对话框
    var $actionRenameBtn;   //重命名按钮
    var $actionDeleteBtn;   //删除按钮
    var $renameDialog;      //重命名文件夹
    var $newFileBtn;        //新建文件按钮
    var $chooseFiletypeSelect; //文件类型选择器
    var $newFileDialog;     //文件名输入框

    var $newFileInput;     //上传文件的input

    function DirectoriesPage() {
        _this = this;
    }

    DirectoriesPage.prototype = new AppPage();

    DirectoriesPage.prototype.dir_root_path = ''; //文件路径
    DirectoriesPage.prototype.dir_extra_path = ''; //文件路径
    DirectoriesPage.prototype.project = ''; //当前选中的app目录

    /**
     * 页面元素初始化
     */
    DirectoriesPage.prototype.onCreate = function () {
        $itemTD = $("td[data-item_path][data-item_name]");
        $path = $("[data-extra_path][data-root_path]");
        $fileActionsMenu = $("#file-actions-menu");
        $itemActionBtn = $(".file-actions-btn");
        $fileActionsMenuHeader = $fileActionsMenu.find(".body>.header");
        $actionRenameBtn = $fileActionsMenu.find("button.rename");
        $actionDeleteBtn = $fileActionsMenu.find("button.delete");
        $renameDialog = $("#rename-dialog");
        $chooseFiletypeSelect = $("#choose-filetype-select");
        $newFileBtn = $("#new-file-btn");
        $newFileDialog = $("#new-file-dialog");
        $newFileInput = $("#upload-file-input");
        $dirProjectsTopMenu = $("#dir-projects-top-menu");
    };

    /**
     * 初始化数据
     */
    DirectoriesPage.prototype.onInitData = function () {
        _this.dir_root_path = $path.data('root_path');
        _this.dir_extra_path = $path.data('extra_path');
        _this.project = $path.data('project');
    };

    /**
     * 页面元素的事件绑定开始了
     */
    DirectoriesPage.prototype.onBindEvent = function () {
        $dirProjectsTopMenu.find("ul li[data-project]").click(function () {
            window.location.href = "/directories?project=" + $(this).data('project');
        });
        $itemActionBtn.unbind().click(function (event) {
            var $this = $(this);
            $fileActionsMenuHeader.html("<small class='text text-danger'>{0}</small>".format($this.data("item_name")));
            $fileActionsMenu.data("item_name", $this.data("item_name"));
            $fileActionsMenu.data("item_path", $this.data("item_path"));
            $fileActionsMenu.miOptionMenu('show');
        });
        $actionRenameBtn.click(function () {
            $renameDialog.find(".dialog>.title").html("重命名<small class='text text-warning'>{0}</small>".format(getCurrentFileName()));
            $renameDialog.miInputDialog('show');
        });
        $actionDeleteBtn.click(function () {
            $.miConfirm({
                title: "确定要删除吗?",
                body: "<small class='text text-danger'>{0}</small>".format(getCurrentFileName())
            }, function () {
                _this.actionFileDelete();
            });
        });
        $renameDialog.bind('confirmed', function (event, data) {
            _this.actionFileRename(data);
        });
        $newFileBtn.click(function () {
            $chooseFiletypeSelect.miSelect('show');
        });
        $chooseFiletypeSelect.bind('confirmed', function (event, data) {
            $newFileDialog.find(".title>span").hide();
            $newFileDialog.find(".title>span.{0}".format(data.value)).show();
            $newFileDialog.data('filetype', data.value).miInputDialog('show');
        });
        $newFileDialog.bind('confirmed', function (event, data) {
            _this.actionCreateDir(data, $(this).data('filetype'));
        });
        $newFileInput.unbind().change(function (event) {
            _this.actionFileUpload();
        });
    };

    /**
     * 页面获取焦点
     */
    DirectoriesPage.prototype.onResume = function () {

    };

    /**
     * 创建文件/文件夹
     * @param newFileName
     * @param fileType
     */
    DirectoriesPage.prototype.actionCreateDir = function (newFileName, fileType) {
        $.miLoading('show');
        $.ajax({
            url: "/directories",
            method: 'post',
            data: {
                filetype: fileType,
                path: "{0}/{1}/{2}".format(_this.dir_root_path, _this.dir_extra_path, newFileName),
                utf8: "√",
                authenticity_token: _this.getAuthenticityToken()
            },
            success: function (data) {
                $.miLoading('hide');
                $.miToast("创建成功", function (data) {
                    window.location.reload();
                });
            }, error: function (data) {
                $.miLoading('hide');
                $.miToast("创建失败");
            }

        });
    };

    /**
     *  重命名文件
     */
    DirectoriesPage.prototype.actionFileRename = function (newFileName) {
        $.miLoading('show');
        $.ajax({
            url: "/directories/rename",
            method: 'put',
            data: {
                old_path: "{0}/{1}/{2}".format(_this.dir_root_path, _this.dir_extra_path, getCurrentFileName()),
                new_path: "{0}/{1}/{2}".format(_this.dir_root_path, _this.dir_extra_path, newFileName),
                utf8: "√",
                authenticity_token: _this.getAuthenticityToken()
            },
            success: function (data) {
                $.miLoading('hide');
                $.miToast("重命名成功", function (data) {
                    window.location.reload();
                });
            }, error: function (data) {
                $.miLoading('hide');
                $.miToast("重命名失败");
            }

        });
    };
    /**
     *  删除文件
     */
    DirectoriesPage.prototype.actionFileDelete = function () {
        $.miLoading('show');
        $.ajax({
            url: "/directories/1?path={0}/{1}/{3}&utf8=√&authenticity_token={2}".format(_this.dir_root_path,
                _this.dir_extra_path,
                _this.getAuthenticityToken(),
                getCurrentFileName()
            ),
            method: 'delete',
            success: function (data) {
                $.miLoading('hide');
                getCurrentFileTR().hide(600, function () {
                    $(this).remove();
                    $.miToast("删除成功");
                });
            }, error: function (data) {
                $.miLoading('hide');
                console.log(data);
                $.miToast("删除失败:{0}".format(data.responseJSON.error));
            }

        });
    };

    /**
     * 上传文件
     */
    DirectoriesPage.prototype.actionFileUpload = function () {
        var data = new FormData();
        data.append("file", $newFileInput[0].files[0]);
        data.append("dir_path", "{0}/{1}".format(_this.dir_root_path, _this.dir_extra_path));
        data.append("authenticity_token", _this.getAuthenticityToken());
        data.append("utf8", "√");

        $.miLoading("show");
        $.ajax({
            url: '/directories/upload',
            type: 'POST',
            processData: false,
            contentType: false,
            data: data,
            success: function (data) {
                $.miLoading("hide");
                $.miToast("上传成功", function () {
                    window.location.reload();
                });
            },
            error: function (data) {
                $.miLoading("hide");
                $.miToast("上传失败");
            }
        });
    };

    /**
     * 获取当前选择中的文件名字
     * @returns {*}
     */
    function getCurrentFileName() {
        return $fileActionsMenu.data("item_name");
    }

    /**
     * 获取当前选中文件的TR
     * @returns {*|jQuery}
     */
    function getCurrentFileTR() {
        return $("td[data-item_name='{0}']".format(getCurrentFileName())).parent();
    }

    return DirectoriesPage;
})();
