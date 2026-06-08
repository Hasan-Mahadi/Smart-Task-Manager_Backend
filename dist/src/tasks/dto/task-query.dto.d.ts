import { TaskPriority, TaskStatus } from '../../common/enums/task.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare enum DeadlineStatus {
    OVERDUE = "overdue",
    UPCOMING = "upcoming",
    NO_DEADLINE = "no_deadline"
}
export declare class TaskQueryDto extends PaginationDto {
    projectId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedToId?: string;
    deadlineStatus?: DeadlineStatus;
}
