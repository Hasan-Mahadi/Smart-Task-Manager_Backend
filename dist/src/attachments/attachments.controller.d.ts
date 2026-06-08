import { AttachmentsService } from './attachments.service';
export declare class AttachmentsController {
    private attachmentsService;
    constructor(attachmentsService: AttachmentsService);
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
