import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  RoboticsDispatchBook1Service,
  CreateRoboticsDispatchDto,
} from '../services/robotics-dispatch-book1.service';

@ApiTags('Autonomous Robotics & Drone Dispatch')
@ApiBearerAuth()
@Controller('inventory')
export class RoboticsDispatchBook1Controller {
  constructor(private readonly book1Service: RoboticsDispatchBook1Service) {}

  @Post('robotics-dispatches/create')
  @ApiOperation({
    summary: 'Create autonomous robotics drone parts dispatch ledger',
  })
  async createRoboticsDispatch(@Body() dto: CreateRoboticsDispatchDto) {
    return this.book1Service.createRoboticsDispatch(dto);
  }

  @Get('robotics-dispatches')
  @ApiOperation({ summary: 'List autonomous robotics drone dispatch logs' })
  async getRoboticsDispatches() {
    return this.book1Service.getRoboticsDispatches();
  }
}
