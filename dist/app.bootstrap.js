"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const config_service_1 = require("./config/config.service");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const globalErrorHandling_1 = require("./common/utilitis/globalErrorHandling");
const auth_controller_1 = __importDefault(require("./modules/auth/auth.controller"));
const connectionDB_1 = __importDefault(require("./DB/connectionDB"));
const redis_connection_1 = __importDefault(require("./DB/redis.connection"));
const app = (0, express_1.default)();
const port = config_service_1.PORT;
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 5 * 1000,
    limit: 20,
    message: {
        success: false,
        message: "Too Many Request...",
    },
});
const bootstrap = async () => {
    app.use(express_1.default.json(), (0, cors_1.default)(), (0, helmet_1.default)(), limiter);
    await (0, connectionDB_1.default)();
    await redis_connection_1.default.connect();
    app.get('/', (req, res, next) => {
        res.status(200).json({ message: "hello on my app" });
    });
    app.use("/auth", auth_controller_1.default);
    app.use("/*demo", (req, res, next) => {
        throw new globalErrorHandling_1.AppError(`Url:${req.originalUrl} with method:${req.method} not found`, 404);
    });
    app.use(globalErrorHandling_1.GlobalErrorHandling);
    app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};
exports.bootstrap = bootstrap;
exports.default = exports.bootstrap;
