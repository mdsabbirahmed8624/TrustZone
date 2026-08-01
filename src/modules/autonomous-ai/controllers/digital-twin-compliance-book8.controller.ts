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
  DigitalTwinComplianceMatrixBook8Service,
  RegisterDigitalTwinDto,
} from '../services/digital-twin-compliance-book8.service';

@ApiTags('Phase 15 Book 8 — Digital Twin Compliance Matrix')
@ApiBearerAuth()
@Controller('api/v15/digital-twin-compliance-book8')
export class DigitalTwinComplianceMatrixBook8Controller {
  private readonly logger = new Logger(
    DigitalTwinComplianceMatrixBook8Controller.name,
  );

  constructor(
    private readonly service: DigitalTwinComplianceMatrixBook8Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register digital twin compliance matrix' })
  async registerDigitalTwin(@Body() dto: RegisterDigitalTwinDto) {
    this.logger.log(
      `POST /api/v15/digital-twin-compliance-book8/register — ${dto.digitalTwinCode}`,
    );
    return this.service.registerDigitalTwin(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all digital twin compliance matrices' })
  async getDigitalTwins() {
    this.logger.log('GET /api/v15/digital-twin-compliance-book8');
    return this.service.getDigitalTwins();
  }
}
