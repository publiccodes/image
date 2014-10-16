window.addEventListener("load", function () {
    initSocialWrap();
    $(window).scroll(function () {
        var scrollTop = $(window).scrollTop();
        moveCenter(scrollTop);
    });
});

function initSocialWrap() {
    setTimeout(function () {
        var H = $(window).innerHeight();
        var h = $(social_button_wrap).height();
        var dh = ~~((H - h) / 2);
        $("#social_button_wrap").css({
            top: dh + "px"
        }).fadeIn(500);
    }, 300);
}

function moveCenter(scrollTop) {
    if ($("#social_button_wrap").is(":animated")) {
        $("#social_button_wrap").stop(true, false);
    }
    var H = $(window).innerHeight();
    var h = $(social_button_wrap).height();
    var dh = ~~((H - h) / 2);
    $("#social_button_wrap").animate({
        "top": (dh + scrollTop) + "px"
    }, 1000, "easeOutBounce");
    //easeOutElastic
    //easeOutBounce
}