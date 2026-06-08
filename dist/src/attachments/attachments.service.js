"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const prisma_service_1 = require("../prisma/prisma.service");
let AttachmentsService = class AttachmentsService {
    constructor(prisma) {
        this.prisma = prisma;
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
    async upload(taskId, file) {
        let fileUrl;
        let fileName = file.originalname;
        if (process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY) {
            const result = await new Promise((resolve, reject) => {
                cloudinary_1.v2.uploader
                    .upload_stream({ folder: 'smart-collab/attachments', resource_type: 'auto' }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                })
                    .end(file.buffer);
            });
            fileUrl = result.secure_url;
        }
        else {
            fileUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        }
        return this.prisma.attachment.create({
            data: { taskId, fileUrl, fileName },
        });
    }
    async findByTask(taskId) {
        return this.prisma.attachment.findMany({
            where: { taskId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async remove(id) {
        await this.prisma.attachment.delete({ where: { id } });
        return { message: 'Attachment deleted successfully' };
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttachmentsService);
//# sourceMappingURL=attachments.service.js.map