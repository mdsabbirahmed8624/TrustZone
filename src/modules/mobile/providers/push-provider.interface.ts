export interface IPushProvider {
  send(
    token: string,
    payload: { title: string; body: string; data?: Record<string, any> },
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;
}
