"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default_success = exports.success_response = void 0;
// 1) middleware بيضيف res.success
const success_response = (req, res, next) => {
    res.success = ({ statusCode = 200, message = "Done", data = undefined } = {}) => {
        return res.status(statusCode).json({ message, data });
    };
    next();
};
exports.success_response = success_response;
// 2) middleware بيتحط في الآخر: لو محدش رد، يبعت success تلقائي
const default_success = (req, res, next) => {
    if (!res.headersSent) {
        return res.success();
    }
};
exports.default_success = default_success;
