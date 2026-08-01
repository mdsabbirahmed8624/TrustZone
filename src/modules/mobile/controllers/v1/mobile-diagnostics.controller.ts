import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { MobileSecurityGuard } from '../../guards/mobile-security.guard';
import {
  DiagnosticsService,
  CreateDiagnosticDto,
} from '../../services/diagnostics.service';
import { PdfReportService } from '../../services/pdf-report.service';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';

@ApiTags('Mobile Device Diagnostics')
@ApiBearerAuth()
@Controller('mobile/diagnostics')
@UseGuards(JwtAuthGuard)
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
export class MobileDiagnosticsController {
  constructor(
    private readonly diagnosticsService: DiagnosticsService,
    private readonly pdfReportService: PdfReportService,
  ) {}

  @Post()
  @UseGuards(MobileSecurityGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log a device diagnostics hardware inspection' })
  async logDiagnostic(
    @CurrentUser('id') technicianId: string,
    @Body() dto: CreateDiagnosticDto,
  ) {
    const result = await this.diagnosticsService.createDiagnostic(
      technicianId,
      dto,
    );
    return {
      message: 'Diagnostics log created successfully.',
      data: result,
    };
  }

  @Get('ticket/:ticketId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch diagnostic reports for a ticket' })
  async getByTicket(@Param('ticketId') ticketId: string) {
    const data = await this.diagnosticsService.getDiagnosticsByTicket(ticketId);
    return {
      message: 'Device diagnostics retrieved successfully.',
      data,
    };
  }

  @Post(':id/report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a PDF audit summary' })
  async generateReport(@Param('id') id: string) {
    const pdfUrl = await this.pdfReportService.generatePdfReport(id);
    return {
      message: 'Diagnostic PDF report generated successfully.',
      data: { pdfUrl },
    };
  }
}
