var _options = {
    maxWidth: 0,
    maxHeight: 0,
    gamma: 1.0,
    quality: 1.0
}
var _progress = 0;

$(function () {
    setEvents();
});

function getOptions() {
    if ($("#max_width").val() != 0) {
        _options.maxWidth = Number($("#max_width").val());
    } else if ($("#max_height").val() != 0) {
        _options.maxHeight = Number($("#max_height").val());
    } else {
        _options.maxWidth = 0;
        _options.maxHeight = 0;
    }

    _options.gamma = $("input[name='gamma']:checked").val();

    if ($("#quality:checked").val()) {
        _options.quality = 0.8;
    } else {
        _options.quality = 1.0;
    }
}

function openFiles(files) {
    getOptions();
    $("#filenum").text(files.length);
    var count = 0;
    var images = new Array();
    _progress = 0;
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
                        loadedImages(images);
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
}

function saveZip(imagedatas) {
    var zip = new JSZip();
    imagedatas.forEach(function (imagedata, index) {
        zip.file(imagedata.filename, imagedata.data, { base64: true });
    });
    var content = zip.generate({ type: "blob" });
    window.navigator.msSaveBlob(content, "images.zip");

    // all browsers?
    // include FileSaver.js
    //saveAs(content, "example4.zip");
}


function getSize(image) {
    var alpha = 100;
    var size = {
        scale: 0,
        width: _options.maxWidth,
        height: _options.maxHeight
    };
    if (_options.maxWidth > 0 && image.width > _options.maxWidth) {
        alpha = ~~((image.width - _options.maxWidth) * 0.04);
        size.scale = (Math.sqrt((_options.maxWidth + alpha) / image.width));
        size.height = ~~((image.height / image.width) * _options.maxWidth);
    } else if (_options.maxHeight > 0 && image.height > _options.maxHeight) {
        alpha = ~~((image.height - _options.maxHeight) * 0.04);
        size.scale = (Math.sqrt((_options.maxHeight + alpha) / image.height));
        size.width = ~~((image.width / image.height) * _options.maxHeight);
    } else {
        size.width = image.width;
        size.height = image.height;
        size.scale = 1;
    }
    return size;
}

function scaleDown(image) {
    var dw, dh, sw, sh;
    var size = getSize(image);
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

function loadedImages(images) {
    var imagedatas = new Array();
    images.forEach(function (image, index) {
        var imagedata = scaleDown(image);
        var worker = new Worker("Scripts/Home/Gamma.js");
        worker.addEventListener('message', function (e) {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            canvas.width = e.data.imagedata.width;
            canvas.height = e.data.imagedata.height;
            context.putImageData(e.data.imagedata, 0, 0);
            imagedatas.push({
                data: canvas.toDataURL("image/jpeg", _options.quality).slice(23),
                filename: image.filename
            });
            _progress++;
            if (_progress == images.length) {
                saveZip(imagedatas);
            }
            $("#progress").text(_progress);
        }, false);
        worker.postMessage({
            imagedata: imagedata,
            filename: image.filename,
            gamma: _options.gamma
        });
    });
}

// #region 物置

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