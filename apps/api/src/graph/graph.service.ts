import { Injectable, Logger } from '@nestjs/common';
import { safeAxios } from '../common/utils/safe-axios';

@Injectable()
export class GraphService {
  private readonly logger = new Logger(GraphService.name);

  isConfigured(): boolean {
    return Boolean(
      process.env.AZURE_TENANT_ID &&
        process.env.AZURE_CLIENT_ID &&
        process.env.AZURE_CLIENT_SECRET &&
        process.env.AZURE_USER_EMAIL,
    );
  }

  async createOnlineMeeting(subject: string, startTime: Date): Promise<string | null> {
    if (!this.isConfigured()) {
      this.logger.warn('Microsoft Graph not configured — skipping Teams link generation');
      return null;
    }

    try {
      const token = await this.getAccessToken();
      const res = await safeAxios.post<{ joinWebUrl?: string }>(
        `https://graph.microsoft.com/v1.0/users/${process.env.AZURE_USER_EMAIL}/onlineMeetings`,
        {
          startDateTime: startTime.toISOString(),
          endDateTime: new Date(startTime.getTime() + 60 * 60 * 1000).toISOString(),
          subject,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        { timeoutMs: 15_000, retries: 1, retryOn: () => false },
      );

      if (res.status < 200 || res.status >= 300) {
        this.logger.error(`Graph API error: ${res.status}`);
        return null;
      }

      return res.data.joinWebUrl ?? null;
    } catch (err) {
      this.logger.error('Failed to create Teams meeting', err);
      return null;
    }
  }

  private async getAccessToken(): Promise<string> {
    const tenantId = process.env.AZURE_TENANT_ID!;
    const res = await safeAxios.post<{ access_token: string }>(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.AZURE_CLIENT_ID!,
        client_secret: process.env.AZURE_CLIENT_SECRET!,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
      { timeoutMs: 15_000, retries: 1, retryOn: () => false },
    );

    return res.data.access_token;
  }
}
