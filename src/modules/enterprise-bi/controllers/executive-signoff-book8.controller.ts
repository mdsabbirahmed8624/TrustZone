import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  ExecutiveSignoffBook8Service,
  ExecuteSignoffDto,
} from '../services/executive-signoff-book8.service';

@ApiTags('Executive Platform Release Sign-offs Book 8')
@ApiBearerAuth()
@Controller('enterprise-bi')
export class ExecutiveSignoffBook8Controller {
  constructor(private readonly book8Service: ExecutiveSignoffBook8Service) {}

  @Post('executive-signoffs-book8/execute')
  @ApiOperation({
    summary: 'Execute executive platform release sign-off Book 8',
  })
  async executeSignoff(@Body() dto: ExecuteSignoffDto) {
    return this.book8Service.executeSignoff(dto);
  }

  @Get('executive-signoffs-book8')
  @ApiOperation({ summary: 'List executive platform release sign-offs Book 8' })
  async getSignoffs() {
    return this.book8Service.getSignoffs();
  }
}
