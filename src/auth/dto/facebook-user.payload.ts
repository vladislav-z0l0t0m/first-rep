import { ProviderType } from 'src/common/constants/provider-type.enum';

export interface FacebookUserPayload {
  provider: ProviderType.FACEBOOK;
  email: string;
  name?: string;
  picture?: string;
  accessToken: string;
}
