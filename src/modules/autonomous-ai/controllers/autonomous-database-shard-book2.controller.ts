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
import {
  AutonomousDatabaseShardBook2Service,
  RegisterDatabaseShardDto,
} from '../services/autonomous-database-shard-book2.service';

@ApiTags('Phase 15 Book 2 — Autonomous Multi-Region Database Sharding')
@ApiBearerAuth()
@Controller('api/v15/autonomous-database-shard-book2')
export class AutonomousDatabaseShardBook2Controller {
  private readonly logger = new Logger(
    AutonomousDatabaseShardBook2Controller.name,
  );

  constructor(private readonly service: AutonomousDatabaseShardBook2Service) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register autonomous multi-region database shard' })
  async registerShard(@Body() dto: RegisterDatabaseShardDto) {
    this.logger.log(
      `POST /api/v15/autonomous-database-shard-book2/register — ${dto.shardCode}`,
    );
    return this.service.registerShard(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all autonomous multi-region database shards' })
  async getShards() {
    this.logger.log('GET /api/v15/autonomous-database-shard-book2');
    return this.service.getShards();
  }
}
