import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { GoogleUserPayload } from '../dto/google-user.payload';
import { ProviderType } from 'src/common/constants/provider-type.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    _refreshToken: string | undefined,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const { name, emails, photos } = profile;

    if (!emails || emails.length === 0 || !emails[0].value) {
      return done(new Error('No email found in Google profile'), undefined);
    }

    const user: GoogleUserPayload = {
      provider: ProviderType.GOOGLE,
      email: emails[0].value,
      name: name?.givenName,
      picture: photos?.[0]?.value,
      accessToken,
    };

    done(null, user);
  }
}
