import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthApiService {
  private readonly logger = new Logger(AuthApiService.name);
  private readonly authServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.authServiceUrl = this.configService.get<string>(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
    );
  }

  async revokeUserTokens(userId: number): Promise<void> {
    try {
      const internalApiKey = this.configService.get<string>('INTERNAL_API_KEY');

      if (!internalApiKey) {
        this.logger.error('INTERNAL_API_KEY not configured');
        return;
      }

      const response = await fetch(
        `${this.authServiceUrl}/internal/auth/revoke-user-tokens`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-api-key': internalApiKey,
          },
          body: JSON.stringify({ userId }),
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `Failed to revoke tokens for user ${userId}: ${response.status} ${response.statusText}`,
        );
        return;
      }

      await response.json();
    } catch (error) {
      this.logger.error(
        `Network error while revoking tokens for user ${userId}: ${(error as Error).message}`,
      );
    }
  }
}
