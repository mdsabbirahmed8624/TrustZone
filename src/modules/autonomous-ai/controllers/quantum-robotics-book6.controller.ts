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
  AutonomousSwarmRoboticsGridBook6Service,
  RegisterSwarmGridDto,
} from '../services/quantum-robotics-book6.service';

@ApiTags('Phase 15 Book 6 — Autonomous Swarm Robotics Diagnostics Grid')
@ApiBearerAuth()
@Controller('api/v15/quantum-robotics-book6')
export class AutonomousSwarmRoboticsGridBook6Controller {
  private readonly logger = new Logger(
    AutonomousSwarmRoboticsGridBook6Controller.name,
  );

  constructor(
    private readonly service: AutonomousSwarmRoboticsGridBook6Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register autonomous swarm robotics diagnostics grid',
  })
  async registerSwarmGrid(@Body() dto: RegisterSwarmGridDto) {
    this.logger.log(
      `POST /api/v15/quantum-robotics-book6/register — ${dto.swarmGridCode}`,
    );
    return this.service.registerSwarmGrid(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all autonomous swarm robotics diagnostics grids',
  })
  async getSwarmGrids() {
    this.logger.log('GET /api/v15/quantum-robotics-book6');
    return this.service.getSwarmGrids();
  }
}
