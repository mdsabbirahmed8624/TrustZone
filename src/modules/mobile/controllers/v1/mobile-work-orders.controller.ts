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
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';
import {
  WorkOrderSignatureService,
  SubmitSignatureDto,
} from '../../services/work-order-signature.service';
import {
  MobileBillingService,
  RecordPaymentDto,
} from '../../services/mobile-billing.service';

@ApiTags('Mobile Work Orders Invoicing & Approvals')
@ApiBearerAuth()
@Controller('mobile/work-orders')
@UseGuards(JwtAuthGuard)
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
@UseGuards(MobileSecurityGuard) // Require root/jailbreak and session security checks on critical workflows
export class MobileWorkOrdersController {
  constructor(
    private readonly signatureService: WorkOrderSignatureService,
    private readonly billingService: MobileBillingService,
  ) {}

  @Post(':ticketId/sign')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit client signature verification' })
  async signWorkOrder(
    @Param('ticketId') ticketId: string,
    @Body() dto: SubmitSignatureDto,
  ) {
    const data = await this.signatureService.submitSignature(ticketId, dto);
    return {
      message: 'Client signature uploaded and recorded successfully.',
      data,
    };
  }

  @Post(':ticketId/invoice')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate dynamic billing invoice summary' })
  async getInvoice(@Param('ticketId') ticketId: string) {
    const data = await this.billingService.generateInvoiceDetails(ticketId);
    return {
      message: 'Invoiced parts & labor cost breakdown calculated.',
      data,
    };
  }

  @Post(':ticketId/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process work order checkout payment' })
  async payWorkOrder(
    @Param('ticketId') ticketId: string,
    @Body() dto: RecordPaymentDto,
  ) {
    const data = await this.billingService.recordMobilePayment(ticketId, dto);
    return {
      message: 'Payment recorded. Ticket successfully marked completed.',
      data,
    };
  }

  @Get(':ticketId/summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve overall checkout details and signatures status',
  })
  async getSummary(@Param('ticketId') ticketId: string) {
    const data = await this.billingService.getWorkOrderSummary(ticketId);
    return {
      message: 'Work order metrics fetched successfully.',
      data,
    };
  }
}
