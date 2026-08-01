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
import { DigitalTwinSimulationBook6Service } from '../services/digital-twin-simulation-book6.service';

@ApiTags('Phase 14 Book 6 — Digital Twin Simulation Engine')
@ApiBearerAuth()
@Controller('api/v14/digital-twin-simulation-book6')
export class DigitalTwinSimulationBook6Controller {
  private readonly logger = new Logger(
    DigitalTwinSimulationBook6Controller.name,
  );

  constructor(private readonly service: DigitalTwinSimulationBook6Service) {}

  @Post('execute')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Execute autonomous digital twin simulation' })
  async executeSimulation(@Body() body: { simulationCode: string }) {
    this.logger.log(
      `POST /api/v14/digital-twin-simulation-book6/execute — ${body.simulationCode}`,
    );
    return this.service.executeSimulation(body);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all digital twin simulation records' })
  async getSimulations() {
    this.logger.log('GET /api/v14/digital-twin-simulation-book6');
    return this.service.getSimulations();
  }
}
