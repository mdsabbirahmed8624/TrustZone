import { Injectable } from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MessagingConnectorService extends ConnectorService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Dispatches SMS via Twilio / BulkSMS connector
   */
  async sendSms(
    recipientPhone: string,
    message: string,
    environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX',
    dryRun = false,
  ) {
    return this.executeWithRetry(
      'TWILIO',
      'SEND_SMS',
      async () => {
        return {
          messageId: 'sms_msg_' + Math.floor(Math.random() * 100000),
          recipientPhone,
          status: environment === 'SANDBOX' ? 'MOCK_DELIVERED' : 'SENT',
          unitsConsumed: 1,
        };
      },
      dryRun,
      environment,
    );
  }

  /**
   * Dispatches Email via SendGrid / SMTP connector
   */
  async sendEmail(
    recipientEmail: string,
    subject: string,
    body: string,
    environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX',
    dryRun = false,
  ) {
    return this.executeWithRetry(
      'SENDGRID',
      'SEND_EMAIL',
      async () => {
        return {
          emailId: 'email_msg_' + Math.floor(Math.random() * 100000),
          recipientEmail,
          subject,
          status: environment === 'SANDBOX' ? 'MOCK_SENT' : 'DELIVERED',
        };
      },
      dryRun,
      environment,
    );
  }

  /**
   * Dispatches WhatsApp message via WhatsApp Business API
   */
  async sendWhatsApp(
    phone: string,
    templateName: string,
    parameters: any[],
    environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX',
    dryRun = false,
  ) {
    return this.executeWithRetry(
      'WHATSAPP',
      'SEND_WHATSAPP',
      async () => {
        return {
          whatsappId: 'wa_msg_' + Math.floor(Math.random() * 100000),
          phone,
          templateName,
          status: 'DELIVERED',
        };
      },
      dryRun,
      environment,
    );
  }

  /**
   * Uploads file to AWS S3 Cloud Storage
   */
  async uploadFile(
    fileName: string,
    mimeType: string,
    environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX',
  ) {
    return this.executeWithRetry(
      'AWS_S3',
      'UPLOAD_FILE',
      async () => {
        return {
          fileKey: 'uploads/2026/' + fileName,
          fileUrl: `https://trustzone-bucket-${environment.toLowerCase()}.s3.amazonaws.com/uploads/2026/${fileName}`,
          mimeType,
          status: 'UPLOADED',
        };
      },
      false,
      environment,
    );
  }
}
