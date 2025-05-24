import { Injectable, BadRequestException } from '@nestjs/common';
import { isEmail } from 'class-validator';

@Injectable()
export class IdentifierValidatorService {
  validate(type: 'email' | 'phone' | 'username', value: string): void {
    if (!value) throw new BadRequestException('Identifier is required');

    switch (type) {
      case 'email':
        if (!isEmail(value)) {
          throw new BadRequestException('Invalid email format');
        }
        break;

      case 'phone':
        if (!/^\+\d{10,15}$/.test(value)) {
          throw new BadRequestException('Invalid phone format');
        }
        break;

      case 'username':
        if (value.length < 3 || value.length > 30) {
          throw new BadRequestException(
            'Username must be between 3 and 30 characters',
          );
        }
        break;

      default:
        throw new BadRequestException('Invalid identifier type');
    }
  }
}
