"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_service_1 = require("../../config/config.service");
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const multer_enum_1 = require("../enum/multer.enum");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3Service {
    client;
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: config_service_1.AWS_REGION,
            credentials: {
                accessKeyId: config_service_1.AWS_SECRET_KEY,
                secretAccessKey: config_service_1.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    async uploadFile({ ACL = client_s3_1.ObjectCannedACL.private, path = "General", file, store_type = multer_enum_1.StoreEnum.memory }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            ACL,
            Key: `social_media_app/${path}/${(0, node_crypto_1.randomUUID)()}_${file.originalname}`,
            Body: store_type === multer_enum_1.StoreEnum.memory ? file.buffer : (0, node_fs_1.createReadStream)(file.path),
            ContentType: file.mimetype
        });
        await this.client.send(command);
        return command.input.Key;
    }
    async uploadLargeFile({ ACL = client_s3_1.ObjectCannedACL.private, path = "General", file, store_type = multer_enum_1.StoreEnum.memory }) {
        const command = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket: config_service_1.AWS_BUCKET_NAME,
                ACL,
                Key: `social_media_app/${path}/${(0, node_crypto_1.randomUUID)()}_${file.originalname}`,
                Body: store_type === multer_enum_1.StoreEnum.memory ? file.buffer : (0, node_fs_1.createReadStream)(file.path),
                ContentType: file.mimetype
            }
        });
        const result = await command.done();
        return result.Key;
    }
    async uploadFiles({ ACL = client_s3_1.ObjectCannedACL.private, path = "General", files, store_type = multer_enum_1.StoreEnum.disk, islarge = false }) {
        let keys;
        if (islarge) {
            keys = await Promise.all(files.map((file) => {
                return this.uploadLargeFile({ file, path, store_type, ACL });
            }));
        }
        else {
            keys = await Promise.all(files.map((file) => {
                return this.uploadFile({ file, path, store_type, ACL });
            }));
        }
        return keys;
    }
    async getFile(Key) {
        const command = new client_s3_1.GetObjectCommand({
            Key,
            Bucket: config_service_1.AWS_BUCKET_NAME
        });
        return await this.client.send(command);
    }
    async createPreSignedUrl({ path, ContentType, fileName }) {
        const Key = `social_media_app/${path}/${(0, node_crypto_1.randomUUID)()}_${fileName}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            Key,
            ContentType
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: 60 });
        return { url, Key };
    }
}
exports.S3Service = S3Service;
