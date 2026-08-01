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
  GenerativeAIHyperTuningEngineBook6Service,
  RegisterHyperTuningEngineDto,
} from '../services/quantum-robotics-genai-tuning-book6.service';

@ApiTags('Phase 15 Book 6 — Generative AI Hyper-Tuning Engine')
@ApiBearerAuth()
@Controller('api/v15/quantum-robotics-genai-tuning-book6')
export class GenerativeAIHyperTuningEngineBook6Controller {
  private readonly logger = new Logger(
    GenerativeAIHyperTuningEngineBook6Controller.name,
  );

  constructor(
    private readonly service: GenerativeAIHyperTuningEngineBook6Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register generative AI hyper-tuning engine' })
  async registerHyperTuningEngine(@Body() dto: RegisterHyperTuningEngineDto) {
    this.logger.log(
      `POST /api/v15/quantum-robotics-genai-tuning-book6/register — ${dto.hyperTuningEngineCode}`,
    );
    return this.service.registerHyperTuningEngine(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all generative AI hyper-tuning engines' })
  async getHyperTuningEngines() {
    this.logger.log('GET /api/v15/quantum-robotics-genai-tuning-book6');
    return this.service.getHyperTuningEngines();
  }
}
