import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
import { IdentifierType } from 'src/common/constants/identifier-type.enum';
import { SetPasswordDto } from './dto/set-password.dto';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';

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

    if (!user.password)
      throw new ForbiddenException('This account does not have a password');

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

  async setPassword(id: number, setPasswordDto: SetPasswordDto): Promise<void> {
    const user = await this.findUserById(id);

    if (user.password)
      throw new BadRequestException('This account already has a password');

    user.password = await this.hashingService.hash(setPasswordDto.password);

    await this.userRepository.save(user);
  }

  async remove(id: number): Promise<UserResponseDto> {
    const user = await this.findUserById(id);
    const removedUser = await this.userRepository.remove(user);
    return this.mapToDto(removedUser);
  }

  async removeAll(): Promise<void> {
    await this.userRepository.clear();
  }

  private async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return user;
  }

  private async checkUnique(
    field: IdentifierType,
    value: string,
    excludeId?: number,
  ): Promise<void> {
    const where = excludeId
      ? { [field]: value, id: Not(excludeId) }
      : { [field]: value };

    const existing = await this.userRepository.findOneBy(where);

    if (existing) {
      throw new ConflictException(
        `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' is already in use`,
      );
    }
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
      checks.push(this.checkUnique(IdentifierType.EMAIL, email, excludeId));
    }
    if (phone) {
      const excludeId = currentUser ? currentUser.id : undefined;
      checks.push(this.checkUnique(IdentifierType.PHONE, phone, excludeId));
    }
    if (username) {
      const excludeId = currentUser ? currentUser.id : undefined;
      checks.push(
        this.checkUnique(IdentifierType.USERNAME, username, excludeId),
      );
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

  async findByField(field: IdentifierType, value: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ [field]: value });

    if (!user) {
      throw new NotFoundException(`User with ${field}: ${value} not found`);
    }

    return user;
  }

  async generateUniqueUsernameByEmail(email: string): Promise<string> {
    let baseUsername = email.split('@')[0].toLowerCase();

    baseUsername = baseUsername.replace(/[^a-z0-9]/g, '');

    if (baseUsername.length < 3) {
      const randomNumber = Math.floor(1000 + Math.random() * 9000);
      baseUsername = `user${randomNumber}`;
    }

    const MAX_BASE_LENGTH = 25;
    if (baseUsername.length > MAX_BASE_LENGTH) {
      baseUsername = baseUsername.substring(0, MAX_BASE_LENGTH);
    }

    let username = baseUsername;
    let counter = 0;

    while (await this.userRepository.findOne({ where: { username } })) {
      counter++;
      username = `${baseUsername}${counter}`;
      if (username.length > 30) {
        const availableBaseLength = MAX_BASE_LENGTH - counter.toString().length;
        username = `${baseUsername.substring(0, availableBaseLength)}${counter}`;
      }
    }

    return username;
  }

  async findOrCreateUserByOauth(
    oauthLoginDto: OAuthLoginDto,
  ): Promise<UserResponseDto> {
    const user: User | null = await this.userRepository.findOneBy({
      email: oauthLoginDto.email,
    });

    if (user) {
      return this.mapToDto(user);
    }

    const username: string = await this.generateUniqueUsernameByEmail(
      oauthLoginDto.email,
    );

    const newUser: User = this.userRepository.create({
      email: oauthLoginDto.email,
      username: username,
      provider: oauthLoginDto.provider,
      password: null,
      phone: null,
    });

    await this.userRepository.save(newUser);

    return this.mapToDto(newUser);
  }

  async authenticateUser(
    authenticateUserDto: AuthenticateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findByField(
      authenticateUserDto.identifierType,
      authenticateUserDto.identifier,
    );
    if (!user.password) {
      throw new UnauthorizedException('This account does not have a password');
    }

    const isPasswordValid = await this.hashingService.compare(
      authenticateUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return this.mapToDto(user);
  }
}
