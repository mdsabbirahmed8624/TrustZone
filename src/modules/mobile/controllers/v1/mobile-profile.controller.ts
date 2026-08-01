import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
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
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../prisma/prisma.service';
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';
import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}

@ApiTags('Mobile API')
@ApiBearerAuth()
@Controller('mobile/profile')
@UseGuards(JwtAuthGuard)
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
export class MobileProfileController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve currently authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Profile details' })
  async getProfile(@CurrentUser('id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        branchId: true,
        isEmailVerified: true,
        skills: true,
        certificationLevel: true,
        rating: true,
      },
    });
    return {
      message: 'Profile retrieved successfully.',
      data: user,
    };
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update profile details (first name, last name)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        branchId: true,
      },
    });
    return {
      message: 'Profile updated successfully.',
      data: user,
    };
  }
}
