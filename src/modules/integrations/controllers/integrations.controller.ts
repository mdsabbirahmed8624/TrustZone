import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { IntegrationService } from '../services/integration.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('integrations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IntegrationsController {
  constructor(private readonly integrationService: IntegrationService) {}

  // ==========================================
  // PROVIDERS & CREDENTIALS
  // ==========================================
  @Get('providers')
  @Permissions('read:settings')
  async getProviders() {
    const data = await this.integrationService.getProviders();
    return { success: true, data };
  }

  @Post('credentials')
  @Permissions('write:settings')
  async configureCredential(
    @Body()
    body: {
      providerCode: string;
      environment: 'SANDBOX' | 'PRODUCTION';
      apiKey?: string;
      apiSecret?: string;
      endpointUrl?: string;
      configJson?: any;
    },
  ) {
    const data = await this.integrationService.configureCredential(
      body.providerCode,
      body.environment || 'SANDBOX',
      body.apiKey,
      body.apiSecret,
      body.endpointUrl,
      body.configJson,
    );
    return { success: true, data };
  }

  @Post('test')
  @Permissions('write:settings')
  async testConnection(
    @Body()
    body: {
      providerCode: string;
      environment?: 'SANDBOX' | 'PRODUCTION';
    },
  ) {
    const data = await this.integrationService.testConnection(
      body.providerCode,
      body.environment || 'SANDBOX',
    );
    return { success: true, data };
  }

  // ==========================================
  // STEP 2: PAYMENT GATEWAYS
  // ==========================================
  @Post('payments/create')
  @Permissions('write:invoices')
  async createPaymentSession(
    @Body()
    body: {
      provider: 'SSLCOMMERZ' | 'AMARPAY' | 'STRIPE' | 'CASH' | 'BANK_TRANSFER';
      amount: number;
      currency?: string;
      invoiceId?: string;
      customerEmail?: string;
      customerPhone?: string;
    },
  ) {
    const data = await this.integrationService.createPaymentSession(body);
    return { success: true, data };
  }

  @Get('payments/:id/status')
  @Permissions('read:invoices')
  async verifyPaymentStatus(@Param('id') id: string) {
    const data = await this.integrationService.verifyPaymentStatus(id);
    return { success: true, data };
  }

  @Post('payments/:id/refund')
  @Permissions('write:invoices')
  async refundPayment(
    @Param('id') id: string,
    @Body() body: { amount?: number; reason?: string },
  ) {
    const data = await this.integrationService.refundPayment(
      id,
      body.amount,
      body.reason,
    );
    return { success: true, data };
  }

  // ==========================================
  // STEP 3: SMS GATEWAY
  // ==========================================
  @Post('sms/send')
  @Permissions('write:settings')
  async sendSMS(
    @Body()
    body: {
      recipient: string;
      message: string;
      type?: 'OTP' | 'TRANSACTIONAL' | 'MARKETING';
    },
  ) {
    const data = await this.integrationService.sendSMS(body);
    return { success: true, data };
  }

  @Post('sms/otp')
  @Permissions('write:settings')
  async sendOTP(@Body('recipient') recipient: string) {
    const data = await this.integrationService.sendOTP(recipient);
    return { success: true, data };
  }

  // ==========================================
  // STEP 4: EMAIL SYSTEM
  // ==========================================
  @Post('email/send')
  @Permissions('write:settings')
  async sendEmail(
    @Body() body: { to: string; subject: string; htmlBody: string },
  ) {
    const data = await this.integrationService.sendEmail(body);
    return { success: true, data };
  }

  // ==========================================
  // STEP 5: WHATSAPP API
  // ==========================================
  @Post('whatsapp/send')
  @Permissions('write:settings')
  async sendWhatsAppMessage(
    @Body()
    body: {
      recipient: string;
      templateName?: string;
      parameters?: string[];
      message?: string;
    },
  ) {
    const data = await this.integrationService.sendWhatsAppMessage(body);
    return { success: true, data };
  }

  // ==========================================
  // STEP 6: PUSH NOTIFICATIONS
  // ==========================================
  @Post('push/send')
  @Permissions('write:settings')
  async sendPushNotification(
    @Body() body: { title: string; body: string; topicOrToken: string },
  ) {
    const data = await this.integrationService.sendPushNotification(body);
    return { success: true, data };
  }

  // ==========================================
  // STEP 7: GOOGLE SERVICES
  // ==========================================
  @Post('google/maps/geocode')
  @Permissions('read:settings')
  async geocodeAddress(@Body('address') address: string) {
    const data = await this.integrationService.geocodeAddress(address);
    return { success: true, data };
  }

  @Post('google/maps/distance')
  @Permissions('read:settings')
  async calculateDistance(
    @Body() body: { origin: string; destination: string },
  ) {
    const data = await this.integrationService.calculateDistance(
      body.origin,
      body.destination,
    );
    return { success: true, data };
  }

  // ==========================================
  // STEP 8: FILE STORAGE
  // ==========================================
  @Post('storage/upload')
  @UseInterceptors(FileInterceptor('file'))
  @Permissions('write:settings')
  async uploadFile(@UploadedFile() file: any) {
    const buffer = file?.buffer || Buffer.from('TrustZone File Data');
    const fileName = file?.originalname || 'attachment.pdf';
    const mimeType = file?.mimetype || 'application/pdf';

    const data = await this.integrationService.uploadFile(
      buffer,
      fileName,
      mimeType,
    );
    return { success: true, data };
  }

  // ==========================================
  // STEP 10: WEBHOOKS ENGINE
  // ==========================================
  @Get('webhooks')
  @Permissions('read:settings')
  async getWebhookEndpoints() {
    const data = await this.integrationService.getWebhookEndpoints();
    return { success: true, data };
  }

  @Post('webhooks')
  @Permissions('write:settings')
  async createWebhookEndpoint(
    @Body() body: { targetUrl: string; events: string[]; secretKey?: string },
  ) {
    const data = await this.integrationService.createWebhookEndpoint(
      body.targetUrl,
      body.events,
      body.secretKey,
    );
    return { success: true, data };
  }

  // ==========================================
  // STEP 11: PUBLIC API KEYS
  // ==========================================
  @Get('api-keys')
  @Permissions('read:settings')
  async getApiKeys() {
    const data = await this.integrationService.getApiKeys();
    return { success: true, data };
  }

  @Post('api-keys')
  @Permissions('write:settings')
  async generateApiKey(
    @Body() body: { name: string; scopes?: string[]; rateLimit?: number },
  ) {
    const data = await this.integrationService.generateApiKey(
      body.name,
      body.scopes,
      body.rateLimit,
    );
    return { success: true, data };
  }

  @Delete('api-keys/:id')
  @Permissions('write:settings')
  async revokeApiKey(@Param('id') id: string) {
    const data = await this.integrationService.revokeApiKey(id);
    return { success: true, data };
  }
}
