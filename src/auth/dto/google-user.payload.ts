import { ProviderType } from 'src/common/constants/provider-type.enum';

export interface GoogleUserPayload {
  provider: ProviderType.GOOGLE;
  email: string;
  name?: string;
  picture?: string;
  accessToken: string;
}
