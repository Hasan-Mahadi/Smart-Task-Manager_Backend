import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Add comment to task' })
  create(@Body() dto: CreateCommentDto, @CurrentUser('id') userId: string) {
    return this.commentsService.create(dto, userId);
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get comments for a task' })
  findByTask(@Param('taskId') taskId: string) {
    return this.commentsService.findByTask(taskId);
  }
}
