var FILE_NUM = 3;
var MAX_WIDTH = 500;
var MAX_HEIGHT = 0;
var QUALITY = 1.0;
var GAMMA = 1.0;

var _progress = 0;

$(function () {
    var count = 0;
    var images = new Array();
    var files = new Array();
    for (var i = 0; i < FILE_NUM; i++) {
        files.push("sample0" + i + ".jpg");
        var filename = "sample0" + i + ".jpg";
        var image = new Image();
        image.src = filename;
        image.filename = filename;
        image.addEventListener("load", function () {
            images.push(this);
            count++;
            if (count == FILE_NUM) {
                loadedImages(images);
            }
        });
    }
});

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


function getSize(image, maxWidth, maxHeight) {
    var alpha = 100;
    var size = {
        scale: 0,
        width: maxWidth,
        height: maxHeight
    };
    if (maxWidth > 0) {
        size.scale = (Math.sqrt((maxWidth + alpha) / image.width));
        size.height = ~~((image.height / image.width) * maxWidth);
    } else {
        size.scale = (Math.sqrt((maxHeight + alpha) / image.height));
        size.width = ~~((image.width / image.height) * maxHeight);
    }
    return size;
}

function scaleDown(image, maxWidth, maxHeight) {
    var dw, dh, sw, sh;
    var size = getSize(image, maxWidth, maxHeight);
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
        var imagedata = scaleDown(image, MAX_WIDTH, MAX_HEIGHT);
        var worker = new Worker("gamma.js");
        worker.addEventListener('message', function (e) {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            canvas.width = e.data.imagedata.width;
            canvas.height = e.data.imagedata.height;
            context.putImageData(e.data.imagedata, 0, 0);
            imagedatas.push({
                data: canvas.toDataURL("image/jpeg", QUALITY).slice(23),
                filename: image.filename
            });
            _progress++;
            if (_progress == FILE_NUM) {
                saveZip(imagedatas);
            }
            $("#progress").text(_progress);
        }, false);
        worker.postMessage({
            imagedata: imagedata,
            filename: image.filename,
            gamma: GAMMA
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