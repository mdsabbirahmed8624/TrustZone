import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';

@ApiTags('Mobile API v2')
@Controller('api/v2/mobile/auth')
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
export class MobileAuthV2Controller {
  @Get('ping')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ping version 2 auth controller' })
  @ApiResponse({ status: 200, description: 'Version 2 active check' })
  async ping() {
    return {
      message: 'Mobile API Version 2 is active and fully functional.',
      data: {
        version: 'v2',
        status: 'stable',
      },
    };
  }
}
