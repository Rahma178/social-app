"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validation = void 0;
const globalErrorHandling_1 = require("../utilitis/globalErrorHandling");
const Validation = (schema) => {
    return async (req, res, next) => {
        const ResultError = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const result = schema[key].safeParse(req[key]);
            console.log(result);
            if (!result.success) {
                ResultError.push(result.error.message);
            }
        }
        if (ResultError.length > 0) {
            throw new globalErrorHandling_1.AppError(JSON.parse(ResultError.join(", ")), 400);
        }
        next();
    };
};
exports.Validation = Validation;
