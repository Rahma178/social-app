"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulterEnum = exports.StoreEnum = void 0;
var StoreEnum;
(function (StoreEnum) {
    StoreEnum["disk"] = "disk";
    StoreEnum["memory"] = "memory";
})(StoreEnum || (exports.StoreEnum = StoreEnum = {}));
exports.MulterEnum = {
    image: ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"],
    video: ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/x-ms-wmv"],
    audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/webm"],
    pdf: ["application/pdf"],
};
