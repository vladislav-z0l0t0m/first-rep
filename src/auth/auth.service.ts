import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  validateUser(email: string, password: string) {
    //TODO: implement logic to get user data from userService and verify it
    if (email === 'test@example.com' && password === '4444') {
      return { id: 1, email };
    }
    return null;
  }

  login(user: any): LoginResponseDto {
    // eslint-disable-next-line
    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,

      user: {
        // eslint-disable-next-line
        id: user.id, // eslint-disable-next-line
        email: user.email,
      },
    };
  }
}
