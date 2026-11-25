import { PutObjectCommand, S3Client, ObjectCannedACL, GetObjectCommand } from "@aws-sdk/client-s3";
import { AWS_REGION, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, AWS_SECRET_KEY } from '../../config/config.service';
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { StoreEnum } from "../enum/multer.enum";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service {
    private readonly client: S3Client;

    constructor() {
        this.client = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_SECRET_KEY,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            }
        });
    }

    async uploadFile({
        ACL = ObjectCannedACL.private,
        path = "General",
        file,
        store_type = StoreEnum.memory
    }: {
        ACL?: ObjectCannedACL,
        path?: string,
        file: Express.Multer.File,
        store_type?: StoreEnum
    }) {
        const command = new PutObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            ACL,
            Key: `social_media_app/${path}/${randomUUID()}_${file.originalname}`,
            Body: store_type === StoreEnum.memory ? file.buffer : createReadStream(file.path),
            ContentType: file.mimetype
        });

        await this.client.send(command);
        return command.input.Key;
    }


    async uploadLargeFile({
    ACL = ObjectCannedACL.private,
    path = "General",
    file,
    store_type = StoreEnum.memory
}: {
    ACL?: ObjectCannedACL,
    path?: string,
    file: Express.Multer.File,
    store_type?: StoreEnum
}) {
    const command = new Upload({
        client: this.client,
        params: {
            Bucket: AWS_BUCKET_NAME,
            ACL,
            Key: `social_media_app/${path}/${randomUUID()}_${file.originalname}`,
            Body: store_type === StoreEnum.memory ? file.buffer : createReadStream(file.path),
            ContentType: file.mimetype
        }
    });

    const result = await command.done();
    return result.Key;
}

    async uploadFiles({
    ACL = ObjectCannedACL.private,
    path = "General",
    files,
    store_type = StoreEnum.disk,
    islarge = false
}: {
    ACL?: ObjectCannedACL,
    path?: string,
    files: Express.Multer.File[],
    store_type?: StoreEnum,
    islarge?: boolean
}) {
    let keys;
    if (islarge) {
        keys = await Promise.all(files.map((file) => {
            return this.uploadLargeFile({ file, path, store_type, ACL });
        }));
    } else {
        keys = await Promise.all(files.map((file) => {
            return this.uploadFile({ file, path, store_type, ACL });
        }));
    }
    return keys;
}

async getFile(Key: string) {
    const command = new GetObjectCommand({
      Key,
      Bucket: AWS_BUCKET_NAME
    });

    return await this.client.send(command);
  }



  async createPreSignedUrl({
    path,
    ContentType,
    fileName
  }: {
    path: string,
    ContentType: string,
    fileName: string,
  }) {
    const Key = `social_media_app/${path}/${randomUUID()}_${fileName}`
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key,
      ContentType
    })
    const url = await getSignedUrl(this.client, command, { expiresIn: 60 })
    return { url, Key }
  }



}