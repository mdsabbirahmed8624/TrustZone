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
  SelfOptimizingZeroTrustMicrosegmentationBook5Service,
  RegisterMicrosegmentDto,
} from '../services/self-optimization-microsegmentation-book5.service';

@ApiTags('Phase 15 Book 5 — Self-Optimizing Zero-Trust Microsegmentation')
@ApiBearerAuth()
@Controller('api/v15/self-optimization-microsegmentation-book5')
export class SelfOptimizingZeroTrustMicrosegmentationBook5Controller {
  private readonly logger = new Logger(
    SelfOptimizingZeroTrustMicrosegmentationBook5Controller.name,
  );

  constructor(
    private readonly service: SelfOptimizingZeroTrustMicrosegmentationBook5Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register self-optimizing zero-trust microsegmentation',
  })
  async registerMicrosegment(@Body() dto: RegisterMicrosegmentDto) {
    this.logger.log(
      `POST /api/v15/self-optimization-microsegmentation-book5/register — ${dto.microsegmentCode}`,
    );
    return this.service.registerMicrosegment(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all self-optimizing zero-trust microsegmentations',
  })
  async getMicrosegments() {
    this.logger.log('GET /api/v15/self-optimization-microsegmentation-book5');
    return this.service.getMicrosegments();
  }
}
