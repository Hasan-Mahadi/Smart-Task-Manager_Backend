import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  @Post(':taskId')
  @ApiOperation({ summary: 'Upload task attachment' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('taskId') taskId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.upload(taskId, file);
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get task attachments' })
  findByTask(@Param('taskId') taskId: string) {
    return this.attachmentsService.findByTask(taskId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attachment' })
  remove(@Param('id') id: string) {
    return this.attachmentsService.remove(id);
  }
}
