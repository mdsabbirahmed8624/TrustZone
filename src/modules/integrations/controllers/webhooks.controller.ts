import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';
import { IdempotencyService } from '../services/idempotency.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  @Post('endpoints')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('webhooks:write')
  @HttpCode(HttpStatus.CREATED)
  async registerEndpoint(
    @Body() body: { targetUrl: string; events: string[]; description?: string },
    @Request() req: any,
  ) {
    return this.webhookService.registerEndpoint(
      body.targetUrl,
      body.events,
      body.description,
      req.user?.id,
    );
  }

  @Post('dispatch')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('webhooks:write')
  @HttpCode(HttpStatus.OK)
  async dispatchEvent(@Body() body: { event: string; payload: any }) {
    return this.webhookService.dispatchEvent(body.event, body.payload);
  }

  @Post('replay/:deliveryId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('webhooks:write')
  @HttpCode(HttpStatus.OK)
  async replayDelivery(@Param('deliveryId') deliveryId: string) {
    return this.webhookService.replayDelivery(deliveryId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('webhooks:read')
  async getDeliveryHistory(@Query('endpointId') endpointId?: string) {
    return this.webhookService.getDeliveryHistory(endpointId);
  }

  @Post('incoming')
  @HttpCode(HttpStatus.OK)
  async handleIncomingWebhook(
    @Headers('x-idempotency-key') idempotencyKey: string,
    @Headers('x-webhook-signature') signature: string,
    @Body() body: any,
  ) {
    // Evaluate Idempotency Key if provided
    if (idempotencyKey) {
      const evalResult = await this.idempotencyService.evaluateIdempotency(
        idempotencyKey,
        '/api/v1/webhooks/incoming',
        body,
      );
      if (evalResult.isReplay) {
        return evalResult.responseBody;
      }
    }

    const response = {
      received: true,
      event: body.event || 'generic.incoming',
      timestamp: new Date().toISOString(),
    };

    if (idempotencyKey) {
      await this.idempotencyService.saveResponse(idempotencyKey, 200, response);
    }

    return response;
  }
}
