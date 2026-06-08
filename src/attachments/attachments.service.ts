import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(taskId: string, file: Express.Multer.File) {
    let fileUrl: string;
    let fileName = file.originalname;

    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY
    ) {
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: 'smart-collab/attachments', resource_type: 'auto' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(file.buffer);
      });
      fileUrl = result.secure_url;
    } else {
      fileUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    return this.prisma.attachment.create({
      data: { taskId, fileUrl, fileName },
    });
  }

  async findByTask(taskId: string) {
    return this.prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    await this.prisma.attachment.delete({ where: { id } });
    return { message: 'Attachment deleted successfully' };
  }
}
