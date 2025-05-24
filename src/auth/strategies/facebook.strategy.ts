import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { FacebookUserPayload } from '../dto/facebook-user.payload';
import { ProviderType } from 'src/common/constants/provider-type.enum';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID')!,
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET')!,
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL')!,
      scope: ['email', 'public_profile'],
      profileFields: ['name', 'email', 'picture'],
    });
  }

  validate(
    accessToken: string,
    _refreshToken: string | undefined,
    profile: Profile,
    done: (err?: Error | null, user?: FacebookUserPayload) => void,
  ): void {
    const { displayName, emails, photos } = profile;

    if (!emails || !emails[0]?.value) {
      return done(
        new Error('No primary email found in Facebook profile'),
        undefined,
      );
    }

    const userPayload: FacebookUserPayload = {
      provider: ProviderType.FACEBOOK,
      email: emails[0].value,
      name: displayName,
      picture: photos?.[0]?.value,
      accessToken,
    };

    done(null, userPayload);
  }
}
