import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSignupDto } from './dto/create-signup.dto';
import { verify, hash } from 'argon2';
import { User, UserType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CreateLoginDto } from './dto/create-login.dto';
import { CreateProductKeyDto } from './dto/create-product-key.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async findByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async signAccessToken(userId: number, email: string): Promise<string> {
    const payload = { id: userId, email };
    return await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('ACCESS_TOKEN_SECRET'),
      expiresIn: 60 * 15,
    });
  }

  async signRefreshToken(userId: number, email: string): Promise<string> {
    const payload = { id: userId, email };
    return await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('REFRESH_TOKEN_SECRET'),
      expiresIn: 60 * 60 * 24 * 7,
    });
  }

  async signCookies(res: Response, accessToken: string, refreshToken: string) {
    await res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    await res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
  }

  async updateRefreshToken(userId: number, refreshToken: string): Promise<User> {
    const hashedToken = await hash(refreshToken);
    return await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }

  async signup(signupData: CreateSignupDto, type: UserType): Promise<User> {
    const { email, password } = signupData;

    if (type !== UserType.BUYER) {
      if (!signupData.productKey) {
        throw new ForbiddenException('Product key not found!');
      }

      const productKeyString = `${email}-${type}-${this.config.get('PRODUCT_KEY_SECRET')}`;
      const validProductKey = await verify(signupData.productKey, productKeyString);

      if (!validProductKey) {
        throw new ForbiddenException('product key is not valid!');
      }
    }

    const user = await this.findByEmail(email);

    if (user) {
      throw new ForbiddenException('Email alreay taken!');
    }

    const hashedPassword = await hash(password);

    signupData.password = hashedPassword;
    signupData.email = email.toLowerCase();
    delete signupData.productKey;

    const newUser = await this.prisma.user.create({ data: { ...signupData, type } });

    delete newUser.password;

    return newUser;
  }

  async login(loginData: CreateLoginDto, response: Response): Promise<User> {
    const { email, password } = loginData;

    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User is not found!');
    }

    const validPassword = await verify(user.password, password);
    if (!validPassword) {
      throw new ForbiddenException('Password is not valid');
    }

    const accessToken = await this.signAccessToken(user.id, email);
    const refreshToken = await this.signRefreshToken(user.id, email);

    await this.signCookies(response, accessToken, refreshToken);
    await this.updateRefreshToken(user.id, refreshToken);

    delete user.password;
    delete user.refreshToken;

    response.status(201).json(user);

    return user;
  }

  async logout(request: Request, response: Response) {
    const decoded = request.user as { id: number; email: string };
    await this.prisma.user.update({ where: { id: decoded.id }, data: { refreshToken: null } });
    await response.clearCookie('accessToken');
    await response.clearCookie('refreshToken');
    response.send('Logged out successfully!');
  }

  async refresh(request: Request, response: Response) {
    const refreshTokenCookie = request.cookies.refreshToken;
    const decoded = request.user as { id: number; email: string };
    const user = await this.findByEmail(decoded.email);

    const validRefreshToken = await verify(user.refreshToken, refreshTokenCookie);

    if (!validRefreshToken) {
      throw new ForbiddenException('Token is not valid');
    }

    const accessToken = await this.signAccessToken(user.id, user.email);
    const refreshToken = await this.signRefreshToken(user.id, user.email);

    await this.signCookies(response, accessToken, refreshToken);
    await this.updateRefreshToken(decoded.id, refreshToken);

    response.send('Refresh token successfully!');
  }

  async createProductKey(productKeyData: CreateProductKeyDto) {
    const { email, type } = productKeyData;
    const productKeyString = `${email}-${type}-${this.config.get('PRODUCT_KEY_SECRET')}`;
    const hashedProductKey = await hash(productKeyString);
    return { productKey: hashedProductKey };
  }
}
