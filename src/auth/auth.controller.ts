import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateSignupDto } from './dto/create-signup.dto';
import { User, UserType } from '@prisma/client';
import { Request, Response } from 'express';
import { CreateLoginDto } from './dto/create-login.dto';
import { AtGuard } from './guard/at.guard';
import { RtGuard } from './guard/rt.guard';
import { CreateProductKeyDto } from './dto/create-product-key.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/:type')
  async signup(
    @Body() signupData: CreateSignupDto,
    @Param('type', new ParseEnumPipe(UserType)) type: UserType,
  ): Promise<User> {
    return this.authService.signup(signupData, type);
  }

  @Post('login')
  async login(@Body() loginData: CreateLoginDto, @Res() response: Response): Promise<User> {
    return this.authService.login(loginData, response);
  }

  @Post('productKey')
  async createProductKey(@Body() productKeyData: CreateProductKeyDto) {
    return this.authService.createProductKey(productKeyData);
  }

  @UseGuards(AtGuard)
  @Delete('logout')
  @HttpCode(204)
  async logout(@Req() request: Request, @Res() response: Response) {
    return this.authService.logout(request, response);
  }

  @UseGuards(RtGuard)
  @Get('refresh')
  async refresh(@Req() request: Request, @Res() response: Response) {
    return this.authService.refresh(request, response);
  }
}
