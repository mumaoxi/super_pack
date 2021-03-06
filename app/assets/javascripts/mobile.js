//= require jquery
//= require bootstrap-sprockets
//= require bootstrap
//= require jextend
//= require components/baidu
//= require components/string
//= require components/header
//= require components/input_dialog
//= require components/top_menu
//= require components/loading
//= require components/toast
//= require components/select
//= require components/modal_view
//= require components/confirm
//= require components/error
//= require components/option_menu
//= require components/red_bag
//= require views/base_view
//= require views/team_member_info_view
//= require views/score_request_dialog_view
//= require pages/app_page
//= require pages/directory_page
//= require pages/directories_page
//= require pages/super_packs_page
//= require pages/user_detail_page
//= require pages/repacks_page
//= require pages/repack_detail_page
//重写alert
window.alert = function (msg) {
    $.miToast(msg);
};

//连接
$("[data-href]").unbind('click').click(function () {
    var href = $(this).data('href');
    if (href) {
        window.location.href = href;
    }
});

var page_url = window.location.pathname;
var page;
if (/p_users\/\d/.test(page_url)) {
    page = new UserDetailPage();
} else if (/directories\/\d/.test(page_url)) {
    page = new DirectoryPage();
} else if (/directories/.test(page_url)) {
    page = new DirectoriesPage();
} else if (/repacks\/\d/.test(page_url)) {
    page = new RepackDetailPage();
} else if (/repacks/.test(page_url)) {
    page = new RepacksPage();
} else if (/\//.test(page_url) || (/super_packs\//.test(page_url))) {
    page = new SuperPacksPage();
}

if (page != undefined) {
    page.start();
}
