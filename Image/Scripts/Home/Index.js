var _options = {
    maxWidth: 0,
    maxHeight: 0,
    gamma: 1.0,
    quality: 1.0
}
var _imagedatas = new Array();

$(function () {
    setEvents();
});

function getOptions() {
    if ($("#max_width").val() != 0) {
        _options.maxWidth = Number($("#max_width").val());
        _options.maxHeight = 0;
    } else if ($("#max_height").val() != 0) {
        _options.maxHeight = Number($("#max_height").val());
        _options.maxWidth = 0;
    } else {
        _options.maxWidth = 0;
        _options.maxHeight = 0;
        _options.isResize = false;
    }

    _options.gamma = $("input[name='gamma']:checked").val();

    if ($("#quality:checked").val()) {
        _options.quality = 0.82;
    } else {
        _options.quality = 0.90;
    }
}

function imagesLoadComplate() {
    $("#images_load_complete").fadeIn(300);
}

function openFiles(files) {
    getOptions();
    $("#filenum").text(0);
    $("#progress").text(0);
    $("#error_list").empty();
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
                        imagesLoadComplate();
                        loadedImages(images);
                    }
                });
                image.src = e.target.result;
            });
            reader.readAsDataURL(file);
        } else {
            count++;
            addErrorList(file.name)
        }
    });
}

function addErrorList(filename) {
    $("#error_list").append(filename + "<br />");
}

function setDropAreaStyle(isEnter) {
    var style = {}
    if (isEnter) {
        style = {
            "background-color": "#fafafa"
        }
    } else {
        style = {
            "background-color": "#f5f5dc"
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
    $("#download_button").click(function () {
        saveImages();
    });
}

function downloadButtonStyle(isEnable) {
    var styles = {};
    if (isEnable) {
        styles = {
            "color": "#fff",
            "background-color": "#05f",
            "cursor": "pointer"
        }
    } else {
        styles = {
            "color": "#000",
            "background-color": "#fff",
            "cursor": "auto"
        }
    }
    $("#download_button").css(styles);
}

function saveZip(imagedatas) {
    var zip = new JSZip();
    imagedatas.forEach(function (imagedata, index) {
        zip.file(imagedata.filename, imagedata.data.slice(23), { base64: true });
    });
    var content = zip.generate({ type: "blob" });
    saveAs(content, "images.zip");
}

function saveJpeg(imagedatas) {
    var canvas = imagedatas[0].canvas;
    canvas.toBlob(function (blob) {
        saveAs(blob, imagedatas[0].filename);
    });
}

function saveImages() {
    if (_imagedatas.length == 1) {
        saveJpeg(_imagedatas);
    } else if (_imagedatas.length > 1) {
        saveZip(_imagedatas);
    } else {
        // 何もしない
    }
}

function getSize(image) {
    var alpha = 100;
    var size = {
        scale: 0,
        width: _options.maxWidth,
        height: _options.maxHeight
    };

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
    } else if (_options.maxHeight > 0) {
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
    return context.getImageData(0, 0, size.width, size.height);
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
    $("#filenum").text(images.length);
    downloadButtonStyle(false);
    _imagedatas = new Array();
    images.forEach(function (image, index) {
        var imagedata = scaleChange(image);
        var worker = new Worker("Scripts/Home/Gamma.js");
        worker.addEventListener("message", function (e) {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            canvas.width = e.data.imagedata.width;
            canvas.height = e.data.imagedata.height;
            context.putImageData(e.data.imagedata, 0, 0);
            _imagedatas.push({
                data: canvas.toDataURL("image/jpeg", _options.quality),
                filename: e.data.filename,
                canvas: canvas
            });
            progressVal++;
            if (progress(progressVal, images.length) == images.length) {
                downloadButtonStyle(true);
            }
        }, false);
        worker.postMessage({
            imagedata: imagedata,
            filename: image.filename,
            gamma: _options.gamma
        });
    });
}

function progress(val, imageNum) {
    $("#progress").text(val);
    var w = ~~((val / imageNum) * 100) * 3;
    $("#progress_val").animate({ "width": w + "px" }, 50);
    return val;
}

function setProgressBar(val, imageNum) {

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