import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { HashingService } from 'src/common/services/hashing.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, phone, username, password } = createUserDto;
    const hashedPassword = await this.hashingService.hash(password);

    await this.validateUniqueFields(email, phone, username);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(newUser);
    return this.mapToDto(savedUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return this.mapToDtos(users);
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.findUserById(id);
    return this.mapToDto(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findUserById(id);

    const { email, phone, username } = updateUserDto;
    await this.validateUniqueFields(email, phone, username, user);

    const updatedUser = this.userRepository.merge(user, updateUserDto);
    const savedUser = await this.userRepository.save(updatedUser);
    return this.mapToDto(savedUser);
  }

  async updatePassword(
    id: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.findUserById(id);

    const isOldPasswordCorrect = await this.hashingService.compare(
      updatePasswordDto.oldPassword,
      user.password,
    );

    if (!isOldPasswordCorrect) {
      throw new ForbiddenException('Invalid old password.');
    }

    if (updatePasswordDto.oldPassword === updatePasswordDto.newPassword) {
      throw new BadRequestException(
        'New password cannot be the same as the old password.',
      );
    }

    user.password = await this.hashingService.hash(
      updatePasswordDto.newPassword,
    );
    await this.userRepository.save(user);
  }

  async remove(id: number): Promise<UserResponseDto> {
    const user = await this.findUserById(id);
    const removedUser = await this.userRepository.remove(user);
    return this.mapToDto(removedUser);
  }

  private async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return user;
  }

  private async checkEmailUnique(
    email: string,
    excludeId?: number,
  ): Promise<void> {
    const where = excludeId ? { email, id: Not(excludeId) } : { email };
    const existing = await this.userRepository.findOneBy(where);

    if (existing)
      throw new ConflictException(`Email '${email}' is already in use`);
  }

  private async checkPhoneUnique(
    phone: string,
    excludeId?: number,
  ): Promise<void> {
    const where = excludeId ? { phone, id: Not(excludeId) } : { phone };
    const existing = await this.userRepository.findOneBy(where);

    if (existing)
      throw new ConflictException(`Phone '${phone}' is already in use`);
  }

  private async checkUsernameUnique(
    username: string,
    excludeId?: number,
  ): Promise<void> {
    const where = excludeId ? { username, id: Not(excludeId) } : { username };
    const existing = await this.userRepository.findOneBy(where);

    if (existing)
      throw new ConflictException(`Username '${username}' is already in use`);
  }

  private async validateUniqueFields(
    email?: string,
    phone?: string,
    username?: string,
    currentUser?: User,
  ): Promise<void> {
    const checks: Promise<void>[] = [];

    if (email) {
      const excludeId = currentUser ? currentUser.id : undefined;
      checks.push(this.checkEmailUnique(email, excludeId));
    }
    if (phone) {
      const excludeId = currentUser ? currentUser.id : undefined;
      checks.push(this.checkPhoneUnique(phone, excludeId));
    }
    if (username) {
      const excludeId = currentUser ? currentUser.id : undefined;
      checks.push(this.checkUsernameUnique(username, excludeId));
    }

    await Promise.all(checks);
  }

  private mapToDto(entity: User): UserResponseDto {
    return plainToInstance(UserResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  private mapToDtos(entities: User[]): UserResponseDto[] {
    return entities.map((entity) => this.mapToDto(entity));
  }
}
