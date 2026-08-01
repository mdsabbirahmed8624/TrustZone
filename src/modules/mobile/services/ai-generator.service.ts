import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiNotificationGeneratorService {
  private readonly logger = new Logger(AiNotificationGeneratorService.name);

  async generateNotificationDraft(
    prompt: string,
    context?: Record<string, any>,
  ): Promise<{ title: string; body: string; suggestedChannel: string }> {
    this.logger.log(`Generating AI Notification draft for prompt: "${prompt}"`);

    // Foundation logic: parse prompt intent and generate mock AI response
    const lowercasePrompt = prompt.toLowerCase();

    let title = 'Alert';
    let body = 'Action required on your account.';
    let suggestedChannel = 'WEBSOCKET';

    if (
      lowercasePrompt.includes('repair') ||
      lowercasePrompt.includes('completed')
    ) {
      title = 'Repair Completed!';
      body =
        'Your device repair has been completed. Please visit the branch to pick it up.';
      suggestedChannel = 'PUSH';
    } else if (
      lowercasePrompt.includes('otp') ||
      lowercasePrompt.includes('login')
    ) {
      title = 'Security Verification Code';
      body = 'Your one-time passcode is {{otpCode}}. Valid for 5 minutes.';
      suggestedChannel = 'SMS';
    } else if (
      lowercasePrompt.includes('payment') ||
      lowercasePrompt.includes('invoice')
    ) {
      title = 'Payment Reminder';
      body =
        'Your invoice #{{invoiceId}} has been generated. Total balance: ${{amount}}.';
      suggestedChannel = 'EMAIL';
    }

    return {
      title,
      body,
      suggestedChannel,
    };
  }
}
