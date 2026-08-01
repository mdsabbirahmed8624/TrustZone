export interface IWhatsAppProvider {
  sendWhatsApp(
    to: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; status: string }>;
}

export interface ISmsGateway {
  sendSms(
    to: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; status: string }>;
}

export interface IEmailProvider {
  sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<{ success: boolean; messageId?: string; status: string }>;
}

export interface IMarketingAutomation {
  syncContact(customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    loyaltyPoints: number;
  }): Promise<void>;
  triggerEvent(
    email: string,
    eventName: string,
    data: Record<string, any>,
  ): Promise<void>;
}

export interface ICustomerSegmentation {
  getSegments(): Promise<
    Array<{ id: string; name: string; criteria: string; count: number }>
  >;
  assignCustomerToSegment(customerId: string, segmentId: string): Promise<void>;
}

export interface ICampaignManager {
  createCampaign(campaign: {
    name: string;
    type: 'EMAIL' | 'SMS' | 'WHATSAPP';
    template: string;
  }): Promise<any>;
  launchCampaign(campaignId: string): Promise<void>;
}

export interface IReferralProgram {
  registerReferral(
    referrerId: string,
    refereeId: string,
  ): Promise<{ referralCode: string }>;
  rewardReferral(referralId: string): Promise<void>;
}

export interface IGiftVoucherSystem {
  issueVoucher(
    customerId: string,
    value: number,
    expiryDays: number,
  ): Promise<{ voucherCode: string; value: number }>;
  redeemVoucher(
    code: string,
    amount: number,
  ): Promise<{ success: boolean; remainingValue: number }>;
}
