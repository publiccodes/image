self.addEventListener("message", function (e) {
    var temp = e.data;
    var gamma = e.data.gamma;
    if (gamma > 1) {
        for (var i = 0; i < temp.imagedata.data.length; i = i + 4) {
            temp.imagedata.data[i + 0] = ~~(255 * Math.pow((temp.imagedata.data[i + 0] / 255), 1 / gamma));
            temp.imagedata.data[i + 1] = ~~(255 * Math.pow((temp.imagedata.data[i + 1] / 255), 1 / gamma));
            temp.imagedata.data[i + 2] = ~~(255 * Math.pow((temp.imagedata.data[i + 2] / 255), 1 / gamma));
            temp.imagedata.data[i + 3] = temp.imagedata.data[i + 3];
        }
    }
    self.postMessage(temp);
}, false);