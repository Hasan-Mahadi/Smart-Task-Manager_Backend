import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCommentDto, userId: string): Promise<{
        user: {
            id: string;
            name: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        taskId: string;
        content: string;
    }>;
    findByTask(taskId: string): Promise<({
        user: {
            id: string;
            name: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        taskId: string;
        content: string;
    })[]>;
}
