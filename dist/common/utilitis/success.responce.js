"use strict";
// import type { NextFunction, Request, Response } from "express";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success_response = void 0;
const success_response = ({ res, statusCode, message = "Done", data = undefined }) => {
    return res.status(statusCode || 200).json({ message, data });
};
exports.success_response = success_response;
