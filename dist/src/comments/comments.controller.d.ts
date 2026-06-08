import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentsController {
    private commentsService;
    constructor(commentsService: CommentsService);
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
