import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DocumentOcrService } from '../services/document-ocr.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('ocr')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OcrController {
  constructor(private readonly ocrService: DocumentOcrService) {}

  @Post(':documentId')
  @Permissions('ocr:write')
  @HttpCode(HttpStatus.OK)
  async processOcr(
    @Param('documentId') documentId: string,
    @Body() body: { sampleTextOverride?: string },
  ) {
    return this.ocrService.processOcr(documentId, body.sampleTextOverride);
  }

  @Get(':documentId')
  @Permissions('ocr:read')
  async getOcrResult(@Param('documentId') documentId: string) {
    return this.ocrService.getOcrResult(documentId);
  }
}
