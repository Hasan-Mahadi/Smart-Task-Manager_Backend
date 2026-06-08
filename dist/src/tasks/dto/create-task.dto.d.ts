import { ValidatorConstraintInterface } from 'class-validator';
import { TaskPriority, TaskStatus } from '../../common/enums/task.enum';
export declare class IsFutureDateConstraint implements ValidatorConstraintInterface {
    validate(value: string): boolean;
    defaultMessage(): string;
}
export declare class CreateTaskDto {
    title: string;
    description?: string;
    projectId: string;
    assignedToId?: string;
    dueDate?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
}
