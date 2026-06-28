import { Injectable, Logger } from '@nestjs/common';
import { safeAxios } from '../common/utils/safe-axios';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  isConfigured(): boolean {
    return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.debug(`Email skipped (not configured): ${subject} → ${to}`);
      return;
    }

    try {
      const res = await safeAxios.post(
        'https://api.resend.com/emails',
        {
          from: process.env.EMAIL_FROM,
          to: [to],
          subject,
          html,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
        { timeoutMs: 10_000, retries: 1, retryOn: () => false },
      );

      if (res.status < 200 || res.status >= 300) {
        this.logger.warn(`Resend error ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      this.logger.warn(`Email send failed: ${err instanceof Error ? err.message : err}`);
    }
  }
}
