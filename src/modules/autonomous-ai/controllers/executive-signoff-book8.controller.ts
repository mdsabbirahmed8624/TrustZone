import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExecutiveSignoffBook8Service } from '../services/executive-signoff-book8.service';

@ApiTags('Phase 14 Book 8 — Executive Release Sign-off')
@ApiBearerAuth()
@Controller('api/v14/executive-signoff-book8')
export class ExecutiveSignoffBook8Controller {
  private readonly logger = new Logger(ExecutiveSignoffBook8Controller.name);

  constructor(private readonly service: ExecutiveSignoffBook8Service) {}

  @Post('signoff')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Approve executive platform release sign-off' })
  async approveSignoff(
    @Body()
    body: {
      signoffCode: string;
      releaseVersion?: string;
      signoffRole?: string;
    },
  ) {
    this.logger.log(
      `POST /api/v14/executive-signoff-book8/signoff — ${body.signoffCode}`,
    );
    return this.service.approveReleaseSignoff(body);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all executive release sign-offs' })
  async getSignoffs() {
    this.logger.log('GET /api/v14/executive-signoff-book8');
    return this.service.getSignoffs();
  }
}
