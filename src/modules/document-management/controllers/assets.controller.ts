import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DocumentStorageService } from '../services/document-storage.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('assets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AssetsController {
  constructor(private readonly storageService: DocumentStorageService) {}

  @Post('validate')
  @Permissions('assets:write')
  @HttpCode(HttpStatus.OK)
  async validateFile(
    @Body()
    body: {
      sampleContent: string;
      mimeType: string;
      maxSizeMb?: number;
    },
  ) {
    const buffer = Buffer.from(
      body.sampleContent || 'Dummy Asset File Content',
    );
    const validation = this.storageService.validateAndComputeChecksum(
      buffer,
      body.mimeType,
      body.maxSizeMb || 50,
    );
    const duplicateCheck = await this.storageService.checkForDuplicate(
      validation.checksumSha256,
    );

    return {
      validation,
      duplicateCheck,
    };
  }

  @Post('scan')
  @Permissions('assets:write')
  @HttpCode(HttpStatus.OK)
  async scanFile(@Body() body: { sampleContent: string }) {
    const buffer = Buffer.from(body.sampleContent || 'Dummy Content');
    return this.storageService.runVirusScan(buffer);
  }
}
