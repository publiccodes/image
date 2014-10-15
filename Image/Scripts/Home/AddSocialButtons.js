window.addEventListener("load", function () {
    var socialButtonWrap = $("<div id='social_button_wrap'></div>");
    socialButtonWrap.append(getFacebookCode());
    socialButtonWrap.append("<div id='space'></div>");
    socialButtonWrap.append(getTwetCode());
    socialButtonWrap.append("<div id='space'></div>");
    socialButtonWrap.append(getGooglePlusCode());
    socialButtonWrap.append("<div id='space'></div>");
    socialButtonWrap.append(getHatenaCode());
    $("body").append(socialButtonWrap);
});

function getTwetCode() {
    var code = "<a href='https://twitter.com/share' class='twitter-share-button' data-count='vertical'>Tweet</a>";
    code += "<script>";
    code += "!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';";
    code += "if(!d.getElementById(id)){js=d.createElement(s);";
    code += "js.id=id;";
    code += "js.src=p+'://platform.twitter.com/widgets.js';";
    code += "fjs.parentNode.insertBefore(js,fjs);";
    code += "}}(document, 'script', 'twitter-wjs');";
    code += "</script>";
    return code;
}

function getFacebookCode() {
    var code = "<iframe src='//www.facebook.com/plugins/like.php?href=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2F&amp;width&amp;layout=box_count&amp;action=like&amp;show_faces=false&amp;share=false&amp;height=65' scrolling='no' frameborder='0' style='border:none; overflow:hidden; height:65px;' allowTransparency='true'></iframe>";
    return code;
}

function getGooglePlusCode() {
    var code = "<div class='g-plusone' data-size='tall'></div>";
    code += "<script type='text/javascript'>";
    code += "window.___gcfg = {lang: 'ja'};";
    code += "(function() {";
    code += "var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;";
    code += "po.src = 'https://apis.google.com/js/platform.js';";
    code += "var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);";
    code += "})();";
    code += "</script>";
    return code;
}

// http://b.hatena.ne.jp/guide/bbutton_prev
function getHatenaCode() {
    return "<a href='http://b.hatena.ne.jp/entry/' class='hatena-bookmark-button' data-hatena-bookmark-layout='vertical' title='このエントリーをはてなブックマークに追加'><img src='http://b.st-hatena.com/images/entry-button/button-only.gif' alt='このエントリーをはてなブックマークに追加' width='20' height='20' style='border: none;' /></a><script type='text/javascript' src='http://cdn-ak.b.st-hatena.com/js/bookmark_button.js' charset='utf-8' async='async'></script>";
}