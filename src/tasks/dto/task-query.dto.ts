import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TaskPriority, TaskStatus } from '../../common/enums/task.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum DeadlineStatus {
  OVERDUE = 'overdue',
  UPCOMING = 'upcoming',
  NO_DEADLINE = 'no_deadline',
}

export class TaskQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ enum: DeadlineStatus })
  @IsOptional()
  @IsEnum(DeadlineStatus)
  deadlineStatus?: DeadlineStatus;
}
