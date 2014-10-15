var _options = {
    noAction: false,
    doResize: false,
    maxWidth: 0,
    maxHeight: 0,
    gamma: 1.0,
    quality: 1.0
}
var _imagedatas = new Array();

$(function () {
    setNotes();
    initOptions();
    setEvents();
});

function setNotes() {
    // TODO:本番環境ではimage/Imageを無くす
    $("#notes").load("/image/Image/Content/Text/Notes.txt");
}

function resetSizeOptions() {
    $("#size_no_change input").attr("checked", true);
    $("#size_no_change").css("background-position", "-65px -45px");
    $("#textbox_width input").val(0);
    $("#textbox_height input").val(0);
}

function initOptions() {
    $("#size_no_change input").attr("checked", true);
    $("#textbox_width input").val(0);
    $("#textbox_height input").val(0);

    $("#gamma_radio_01 input").attr("checked", true);
    $("#gamma_radio_02 input").attr("checked", false);
    $("#gamma_radio_03 input").attr("checked", false);

    $("#quality_radio_01 input").attr("checked", true);
    $("#quality_radio_02 input").attr("checked", false);
}

function getOptions() {
    _options.noAction = false;
    var width = $("#textbox_width input").val();
    var height = $("#textbox_height input").val();
    if (!isNaN(width) && width != 0) {
        _options.maxWidth = width;
        _options.maxHeight = 0;
    } else if (!isNaN(height) && height != 0) {
        _options.maxHeight = height;
        _options.maxWidth = 0;
    } else {
        resetSizeOptions();
        _options.maxWidth = 0;
        _options.maxHeight = 0;
    }
    _options.doResize = !$("#size_no_change input").is(":checked");
    _options.gamma = $("input[name='gamma']:checked").val();
    if ($("#quality_radio_02 input").is(":checked")) {
        _options.quality = 0.80;
    } else {
        _options.quality = 0.92;
    }
    if (!_options.doResize && _options.gamma == 1.0 && _options.quality == 0.92) {
        _options.noAction = true;
    }
}

function openFiles(files) {
    dispProgressWrap(true);
    getOptions();
    var count = 0;
    var images = new Array();
    $(files).each(function (index, file) {
        if (file.type == "image/jpeg") {
            var reader = new FileReader();
            reader.addEventListener("load", function (e) {
                var image = new Image();
                image.filename = file.name;
                image.addEventListener("load", function () {
                    images.push(this);
                    count++;
                    if (count == files.length) {
                        if (!_options.noAction) {
                            loadedImages(images);
                        } else {
                            images.forEach(function (image, index) {
                                _imagedatas.push({
                                    data: image.src,
                                    filename: image.filename
                                });
                            });
                            dispProgressWrap(false);
                            downloadButtonStyle(true);
                        }
                    }
                });
                image.src = e.target.result;
            });
            reader.readAsDataURL(file);
        } else {
            count++;
        }
    });
}

function setDropAreaStyle(isEnter) {
    var style = {}
    if (isEnter) {
        style = {
            "background-position": "left bottom"
        }
    } else {
        style = {
            "background-position": "left top"
        }
    }
    $("#file_drop_area").css(style);
}

function setEvents() {
    $("#file_drop_area").on("dragover", function (event) {
        event.preventDefault();
    });
    $("#file_drop_area").on("dragenter", function (event) {
        setDropAreaStyle(true);
        event.preventDefault();
    });
    $("#file_drop_area").on("dragleave", function (event) {
        setDropAreaStyle(false);
        event.preventDefault();
    });
    $("#file_drop_area").on("drop", function (event) {
        setDropAreaStyle(false);
        event.preventDefault();
        var files = event.originalEvent.dataTransfer.files;
        openFiles(files);
    });
    $("#dammy_input").click(function () {
        $("#file_select_button").click();
    });
    $("#file_select_button").change(function (event) {
        setDropAreaStyle(false);
        openFiles(this.files);
    });
    $("#download_button").click(function () {
        saveImages();
    });

    $("#size_no_change input").change(function () {
        if ($(this).is(":checked")) {
            $("#size_no_change").css("background-position", "-65px -45px");
        } else {
            $("#size_no_change").css("background-position", "-65px -22px");
        }
    });
    $("#textbox_width input").change(function () {
        $("#size_no_change input").attr("checked", false);
        $("#size_no_change").css("background-position", "-65px -22px");
        $("#textbox_height input").val(0);
    });
    $("#textbox_width input").keydown(function () {
        $("#size_no_change input").attr("checked", false);
        $("#size_no_change").css("background-position", "-65px -22px");
        $("#textbox_height input").val(0);
    });
    $("#textbox_height input").change(function () {
        $("#size_no_change input").attr("checked", false);
        $("#size_no_change").css("background-position", "-65px -22px");
        $("#textbox_width input").val(0);
    });
    $("#textbox_height input").keydown(function () {
        $("#size_no_change input").attr("checked", false);
        $("#size_no_change").css("background-position", "-65px -22px");
        $("#textbox_width input").val(0);
    });

    $("#option_02 input").change(function () {
        var id = $(this).data("id");
        var bgX = $(this).data("bgX");
        $("#gamma_radio_01").css("background-position", "-65px -22px");
        $("#gamma_radio_02").css("background-position", "-153px -22px");
        $("#gamma_radio_03").css("background-position", "-255px -22px");
        $("#gamma_radio_" + id).css("background-position", bgX + " -45px");
    });

    $("#option_03 input").change(function () {
        var id = $(this).data("id");
        var bgX = $(this).data("bgX");
        $("#quality_radio_01").css("background-position", "-65px -22px");
        $("#quality_radio_02").css("background-position", "-326px -22px");
        $("#quality_radio_" + id).css("background-position", bgX + " -45px");
    });
}

function downloadButtonStyle(isEnable) {
    var styles = {};
    if (isEnable) {
        styles = {
            "background-position": "left -213px",
            "cursor": "pointer"
        }
    } else {
        styles = {
            "background-position": "left -143px",
            "cursor": "auto"
        }
    }
    $("#download_button").css(styles);
    $("#download_button").hover(function () {
        $(this).css("background-position", "left -283px");
    }, function () {
        $(this).css("background-position", "left -213px");
    });
}

function saveZip(imagedatas) {
    var zip = new JSZip();
    imagedatas.forEach(function (imagedata, index) {
        zip.file(imagedata.filename, imagedata.data.slice(23), { base64: true });
    });
    var content = zip.generate({ type: "blob" });
    saveAs(content, "images.zip");
}

function dataURL2Blob(dataurl) {
    var barr;
    var bin;
    var i;
    var len;
    bin = atob(dataurl.split("base64,")[1]);
    len = bin.length;
    barr = new Uint8Array(len);
    i = 0;
    while (i < len) {
        barr[i] = bin.charCodeAt(i);
        i++;
    }
    return new Blob([barr], {
        type: "image/jpeg"
    });
}

function saveJpeg(imagedatas) {
    var canvas = imagedatas[0].canvas;
    if (canvas != null || canvas != undefined) {
        canvas.toBlob(function (blob) {
            saveAs(blob, imagedatas[0].filename);
        }, "image/jpeg", _options.quality);
    } else {
        var blob = dataURL2Blob(imagedatas[0].data);
        saveAs(blob, imagedatas[0].filename);
    }
}

function saveImages() {
    $("#wait_create_files_mask").fadeIn(100);
    setTimeout(function () {
        if (_imagedatas.length == 1) {
            saveJpeg(_imagedatas);
        } else if (_imagedatas.length > 1) {
            saveZip(_imagedatas);
        } else {
            // 何もしない
        }
        $("#wait_create_files_mask").fadeOut(100);
    }, 100);
}

function getSize(image) {
    var alpha = 100;
    var size = {
        scale: 0,
        width: _options.maxWidth,
        height: _options.maxHeight
    };
    if (_options.doResize) {
        if (_options.maxWidth > 0) {
            if (image.width > _options.maxWidth) {
                alpha = ~~((image.width - _options.maxWidth) * 0.04);
                size.scale = (Math.sqrt((_options.maxWidth + alpha) / image.width));
                size.height = ~~((image.height / image.width) * _options.maxWidth);
            } else if (image.width == _options.maxWidth) {
                size.scale = 1;
                size.width = image.width;
                size.height = image.height;
            } else {
                size.width = _options.maxWidth;
                size.height = ~~((image.height / image.width) * _options.maxWidth);
                size.scale = 1;
            }
        } else {
            if (image.height > _options.maxHeight) {
                alpha = ~~((image.height - _options.maxHeight) * 0.04);
                size.scale = (Math.sqrt((_options.maxHeight + alpha) / image.height));
                size.width = ~~((image.width / image.height) * _options.maxHeight);
            } else if (image.height == _options.maxHeight) {
                size.scale = 1;
                size.width = image.width;
                size.height = image.height;
            } else {
                size.width = ~~((image.width / image.height) * _options.maxHeight);
                size.height = _options.maxHeight;
                size.scale = 1;
            }
        }
    } else {
        size.scale = 1;
        size.width = image.width;
        size.height = image.height;
    }
    return size;
}

function scaleDown(image, size) {
    var dw, dh, sw, sh;
    var canvas1 = document.createElement("canvas");
    var context1 = canvas1.getContext("2d");
    var canvas2 = document.createElement("canvas");
    var context2 = canvas2.getContext("2d");

    // 一回目の縮小
    dw = canvas2.width = ~~(image.width * size.scale);
    dh = canvas2.height = ~~(image.height * size.scale);
    context2.drawImage(image, 0, 0, dw, dh);

    // 二回目の縮小
    dw = ~~(canvas2.width * size.scale);
    dh = ~~(canvas2.height * size.scale);
    context2.drawImage(canvas2, 0, 0, dw, dh);

    // 三回目の縮小
    sw = ~~(canvas2.width * size.scale);
    sh = ~~(canvas2.height * size.scale);
    dw = canvas1.width = size.width;
    dh = canvas1.height = size.height;
    context1.drawImage(canvas2, 0, 0, sw, sh, 0, 0, dw, dh);
    return context1.getImageData(0, 0, size.width, size.height);
}

function scaleUp(image, size) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = size.width;
    canvas.height = size.height;
    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, size.width, size.height);
    var imagedata = context.getImageData(0, 0, size.width, size.height);
    return imagedata;
}

function scaleChange(image) {
    var size = getSize(image);
    if (size.scale < 1) {
        return scaleDown(image, size);
    } else {
        return scaleUp(image, size);
    }
}

function loadedImages(images) {
    var progressVal = 0;
    downloadButtonStyle(false);
    _imagedatas = new Array();
    images.forEach(function (image, index) {
        var imagedata = scaleChange(image);
        var worker = new Worker("Scripts/Home/Gamma.js");
        worker.addEventListener("message", function (e) {
            addImagedatas(e.data.imagedata, e.data.filename, ++progressVal, images.length);
        }, false);
        worker.postMessage({
            imagedata: imagedata,
            filename: image.filename,
            gamma: _options.gamma
        });
    });
}

function addImagedatas(imagedata, filename, progressVal, imagesLength) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = imagedata.width;
    canvas.height = imagedata.height;
    context.putImageData(imagedata, 0, 0);
    _imagedatas.push({
        data: canvas.toDataURL("image/jpeg", _options.quality),
        filename: filename,
        canvas: canvas
    });
    if (progress(progressVal, imagesLength)) {
        downloadButtonStyle(true);
        dispProgressWrap(false);
    }
}

function dispProgressWrap(visible) {
    if (visible) {
        $("#progress_wrap").show();
        $("#progress_bar span").css("width", "0px");
    } else {
        $("#progress_wrap").fadeOut(100);
    }
}

function progress(val, imageNum) {
    var w = ~~((val / imageNum) * 100) * 5;
    $("#progress_bar span").animate({ "width": w + "px" }, 50);
    return (val >= imageNum);
}

// #region resize.js バージョン

function resize0(images) {
    var imagedatas = new Array();
    images.forEach(function (image, index) {
        var filename = image.filename;
        var originalWidth = image.width;
        var originalHeight = image.height;
        var newWidth;
        var newHeight;
        if (originalWidth > originalHeight) {
            newWidth = _options.maxWidth;
            newHeight = originalHeight * _options.maxWidth / originalWidth;
        } else {
            newWidth = originalWidth * _options.maxHeight / originalHeight;
            newHeight = _options.maxHeight;
        }
        var useWebWorker = true;
        var blendAlpha = true;
        interpolationPass = true;
        var resizer = new Resize(originalWidth, originalHeight, newWidth, newHeight, blendAlpha, interpolationPass, useWebWorker, function (frameBuffer) {
            var canvasDst = document.createElement("canvas");
            canvasDst.width = newWidth;
            canvasDst.height = newHeight;
            var contextDst = canvasDst.getContext("2d");
            var imageBuffer = contextDst.createImageData(newWidth, newHeight);
            var data = imageBuffer.data;
            var length = data.length;
            for (var x = 0; x < length; ++x) {
                data[x] = frameBuffer[x] & 0xFF;
            }
            contextDst.putImageData(imageBuffer, 0, 0);
            var imagedata = contextDst.getImageData(0, 0, newWidth, newHeight);
            imagedata.filename = this.filename;
            imagedatas.push(imagedata);
            if (imagedatas.length == images.length) {
                loadedImages2(imagedatas);
            }
        });
        var canvasSrc = document.createElement("canvas");
        canvasSrc.width = originalWidth;
        canvasSrc.height = originalHeight;
        var contextSrc = canvasSrc.getContext("2d");
        contextSrc.drawImage(image, 0, 0, originalWidth, originalHeight);
        var dataToScale = contextSrc.getImageData(0, 0, originalWidth, originalHeight).data;
        resizer.filename = image.filename;;
        resizer.resize(dataToScale);
    });
}

function loadedImages2(imagedatas) {
    var imagedatas2 = new Array();
    imagedatas.forEach(function (imagedata, index) {
        var worker = new Worker("Scripts/Home/Gamma.js");
        worker.addEventListener('message', function (e) {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            canvas.width = e.data.imagedata.width;
            canvas.height = e.data.imagedata.height;
            context.putImageData(e.data.imagedata, 0, 0);
            imagedatas2.push({
                data: canvas.toDataURL("image/jpeg", _options.quality).slice(23),
                filename: "min_" + e.data.filename
            });
            _progress++;
            if (_progress == imagedatas.length) {
                saveZip(imagedatas2);
            }
            $("#progress").text(_progress);
        }, false);
        worker.postMessage({
            imagedata: imagedata,
            filename: imagedata.filename,
            gamma: _options.gamma
        });
    });
}

// #endregion

// #region 物置

function scaleDown0(image, maxWidth, maxHeight) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = 500;
    canvas.height = 299;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    var flag = false;
    context.msImageSmoothingEnabled = flag;
    context.mozImageSmoothingEnabled = flag;
    context.webkitImageSmoothingEnabled = flag;
    context.imageSmoothingEnabled = flag;

    return context.getImageData(0, 0, 500, 299);
}

/*
 * 輝度調整
 */
function brightness(src) {
    var gamma = 2.5;
    for (var i = 0; i < src.data.length; i = i + 4) {
        src.data[i + 0] = ~~(255 * Math.pow((src.data[i + 0] / 255), 1 / gamma));
        src.data[i + 1] = ~~(255 * Math.pow((src.data[i + 1] / 255), 1 / gamma));
        src.data[i + 2] = ~~(255 * Math.pow((src.data[i + 2] / 255), 1 / gamma));
        src.data[i + 3] = src.data[i + 3];
    }
    return src;
}

function resize(img, maxWidth, maxHeight) {
    var size = {
        width: maxWidth,
        height: maxHeight
    };
    if (maxWidth != 0) {
        size.width = maxWidth;
        size.height = ~~((img.height / img.width) * maxWidth);
    }
    if (maxHeight != 0) {
        size.height = maxHeight;
        size.width = ~~((img.width / img.height) * maxHeight);
    }
    return size;
}

function scaleDown2(img, maxWidth, maxHeight) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var size = resize(img, MAX_WIDTH, MAX_HEIGHT);
    canvas.width = size.width;
    canvas.height = size.height;
    context.drawImage(img, 0, 0, size.width, size.height);
    return canvas;
}

function scaleDown3(img, maxWidth, maxHeight) {
    var size = getSize(img, maxWidth, maxHeight);
    var canvas1 = document.createElement("canvas");
    var context1 = canvas1.getContext("2d");

    /// step 1
    var canvas2 = document.createElement("canvas");
    var context2 = canvas2.getContext("2d");

    canvas2.width = ~~(img.width * size.scale);
    canvas2.height = ~~(img.height * size.scale);
    context2.drawImage(img, 0, 0, canvas2.width, canvas2.height);

    /// step 2
    context2.drawImage(canvas2, 0, 0, ~~(canvas2.width * size.scale), ~~(canvas2.height * size.scale),
        0, 0, 500, 299);
    return canvas2;

    //canvas1.width = size.width;
    //canvas1.height = size.height;
    //context1.drawImage(canvas2, 0, 0, ~~(canvas2.width * size.scale), ~~(canvas2.height * size.scale),
    //                 0, 0, canvas1.width, canvas1.height);
    //return canvas1;
}

//var zip = new JSZip();
//zip.file("Hello.txt", "Hello World\n");
//var img = zip.folder("images");
//img.file("smile.gif", imgData, { base64: true });
//var content = zip.generate({ type: "blob" });
//// see FileSaver.js
//saveAs(content, "example.zip");

// #endregion