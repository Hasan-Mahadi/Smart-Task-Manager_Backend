import { PrismaService } from '../prisma/prisma.service';
export declare class AttachmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    upload(taskId: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        taskId: string;
        fileUrl: string;
        fileName: string | null;
    }>;
    findByTask(taskId: string): Promise<{
        id: string;
        createdAt: Date;
        taskId: string;
        fileUrl: string;
        fileName: string | null;
    }[]>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
