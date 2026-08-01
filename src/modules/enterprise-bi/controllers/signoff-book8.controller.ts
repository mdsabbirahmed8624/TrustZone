import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  SignoffBook8Service,
  ExecuteSignoffDto,
} from '../services/signoff-book8.service';

@ApiTags('Enterprise Platform Release Sign-off')
@ApiBearerAuth()
@Controller('enterprise-bi')
export class SignoffBook8Controller {
  constructor(private readonly book8Service: SignoffBook8Service) {}

  @Post('platform-signoffs/signoff')
  @ApiOperation({
    summary: 'Execute final executive sign-off for ERP platform release',
  })
  async executePlatformSignoff(@Body() dto: ExecuteSignoffDto) {
    return this.book8Service.executePlatformSignoff(dto);
  }

  @Get('platform-signoffs')
  @ApiOperation({
    summary: 'List executive platform release sign-off log records',
  })
  async getSignoffs() {
    return this.book8Service.getSignoffs();
  }
}
