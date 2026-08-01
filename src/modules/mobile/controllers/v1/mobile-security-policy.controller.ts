import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';

@ApiTags('Mobile Security Policies')
@ApiBearerAuth()
@Controller('mobile/security')
@UseGuards(JwtAuthGuard)
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
export class MobileSecurityPolicyController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('policy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Retrieve dynamic security policies and SSL certificate pinning SHA-256 hashes',
  })
  async getPolicy() {
    let policy = await this.prisma.mobileSecurityPolicy.findFirst();
    if (!policy) {
      policy = await this.prisma.mobileSecurityPolicy.create({
        data: {
          blockJailbroken: true,
          requireBiometrics: false,
          certPinningHashes: ['sha256/AArsp13y...'],
        },
      });
    }
    return {
      message: 'Mobile security policy retrieved successfully.',
      data: policy,
    };
  }
}
