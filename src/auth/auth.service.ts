import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserService } from 'src/user/user.service';
import { HashingService } from 'src/common/services/hashing.service';
import { User } from 'src/user/entities/user.entity';
import { IdentifierType } from '../common/constants/identifier-type.enum';
import { UserDto } from './dto/user.dto';
import { GoogleUserPayload } from './dto/google-user.payload';
import { FacebookUserPayload } from './dto/facebook-user.payload';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
    private passwordService: HashingService,
  ) {}

  async validateUser(
    identifier: string,
    type: IdentifierType,
    password: string,
  ): Promise<User> {
    const user = await this.usersService.findByField(type, identifier);

    if (!user.password) {
      throw new ForbiddenException('This account does not have a password');
    }

    const isPasswordValid = await this.passwordService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  login(user: User): LoginResponseDto {
    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    const userDto: UserDto = {
      id: user.id,
      email: user.email,
    };

    return {
      access_token,
      user: userDto,
    };
  }

  async handleOAuthLogin(
    oauthPayload: GoogleUserPayload | FacebookUserPayload,
  ): Promise<LoginResponseDto> {
    if (!oauthPayload || !oauthPayload.email) {
      throw new UnauthorizedException(
        'Insufficient information from Oauth provider.',
      );
    }

    const user = await this.usersService.findOrCreateUserByOauth(
      oauthPayload.email,
      oauthPayload.provider,
    );

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
