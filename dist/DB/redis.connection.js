"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const redis_1 = require("redis");
const config_service_1 = require("../config/config.service");
class RedisService {
    redis_client;
    constructor() {
        this.redis_client = (0, redis_1.createClient)({
            url: config_service_1.REDIS_URL
        });
        this.handleEvent();
    }
    handleEvent() {
        this.redis_client.on("error", (error) => {
            console.log(`Redis Error: ${error.message}`);
        });
    }
    async connect() {
        this.redis_client.connect();
        console.log("Redis connected Successfully");
    }
    setValue = async ({ key, value, ttl }) => {
        try {
            value = typeof value == "string" ? value : JSON.stringify(value);
            ttl ?
                await this.redis_client.set(key, value, { EX: ttl }) :
                await this.redis_client.set(key, value);
        }
        catch (error) {
            console.log(error, "\nredis setValue failed");
        }
    };
    update = async ({ key, value, ttl }) => {
        try {
            if (!await this.redis_client.exists(key))
                return 0;
            await this.redis_client.set(key, value, { EX: ttl });
        }
        catch (error) {
            console.log(error, "\nredis update failed");
        }
    };
    getValue = async (key) => {
        try {
            try {
                return JSON.parse(await this.redis_client.get(key));
            }
            catch (error) {
                return await this.redis_client.get(key);
            }
        }
        catch (error) {
            console.log(error, "\nredis get failed");
        }
    };
    ttl = async (key) => {
        try {
            return await this.redis_client.ttl(key);
        }
        catch (error) {
            console.log(error, "\nredis ttl failed");
        }
    };
    exists = async (key) => {
        try {
            return await this.redis_client.exists(key);
        }
        catch (error) {
            console.log(error, "\nredis exists failed");
        }
    };
    expire = async ({ key, ttl }) => {
        try {
            return await this.redis_client.expire(key, ttl);
        }
        catch (error) {
            console.log(error, "\nredis expire failed");
        }
    };
    deleteKey = async (key) => {
        try {
            if (!key?.length)
                return 0;
            return await this.redis_client.del(key);
        }
        catch (error) {
            console.log(error, "\nredis deleteKey failed");
        }
    };
    keys = async (key) => {
        try {
            return await this.redis_client.keys(`${key}*`);
        }
        catch (error) {
            console.log(error, "\nredis keys failed");
        }
    };
    incr = async (key) => {
        try {
            return await this.redis_client.incr(key);
        }
        catch (error) {
            console.log(error, "\nredis incr failed");
        }
    };
}
exports.RedisService = RedisService;
exports.default = new RedisService();
