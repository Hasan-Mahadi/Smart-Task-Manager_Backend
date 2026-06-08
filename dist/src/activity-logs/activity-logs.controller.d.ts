import { ActivityLogsService } from './activity-logs.service';
export declare class ActivityLogsController {
    private activityLogsService;
    constructor(activityLogsService: ActivityLogsService);
    findRecent(limit?: number, projectId?: string): Promise<({
        user: {
            id: string;
            name: string;
            avatar: string | null;
        };
        project: {
            id: string;
            name: string;
        } | null;
        task: {
            id: string;
            title: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        projectId: string | null;
        action: string;
        taskId: string | null;
    })[]>;
}
