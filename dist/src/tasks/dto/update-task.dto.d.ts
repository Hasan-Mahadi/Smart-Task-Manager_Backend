import { TaskPriority, TaskStatus } from '../../common/enums/task.enum';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    assignedToId?: string;
    dueDate?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
}
