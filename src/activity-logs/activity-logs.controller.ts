import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private activityLogsService: ActivityLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent activity logs' })
  findRecent(
    @Query('limit') limit?: number,
    @Query('projectId') projectId?: string,
  ) {
    return this.activityLogsService.findRecent(
      limit ? Number(limit) : 10,
      projectId,
    );
  }
}
