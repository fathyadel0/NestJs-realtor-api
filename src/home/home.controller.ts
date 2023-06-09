import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { HomeReponseDto } from './dto/home-response.dto';
import { QueryHomeDto } from './dto/query-home.dto';
import { DecodedUser, User } from 'src/auth/decorator/user.decorator';
import { AtGuard } from 'src/auth/guard/at.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserType } from '@prisma/client';

@Controller('homes')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  async getAll(@Query() homeQuery: QueryHomeDto): Promise<HomeReponseDto[]> {
    return this.homeService.getAll(homeQuery);
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<HomeReponseDto> {
    return this.homeService.getOne(id);
  }

  @Roles(UserType.ADMIN, UserType.REALTOR)
  @UseGuards(AtGuard, RoleGuard)
  @Post()
  async create(@Body() homeData: CreateHomeDto, @User() user: DecodedUser): Promise<HomeReponseDto> {
    console.log(user);
    return this.homeService.create(homeData, user);
  }

  @Roles(UserType.ADMIN, UserType.REALTOR)
  @UseGuards(AtGuard, RoleGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() homeData: UpdateHomeDto): Promise<HomeReponseDto> {
    return this.homeService.update(id, homeData);
  }

  @Roles(UserType.ADMIN, UserType.REALTOR)
  @UseGuards(AtGuard, RoleGuard)
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.delete(id);
  }
}
