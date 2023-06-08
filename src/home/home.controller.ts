import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { HomeReponseDto } from './dto/home-response.dto';
import { QueryHomeDto } from './dto/query-home.dto';

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

  @Post()
  async create(@Body() homeData: CreateHomeDto): Promise<HomeReponseDto> {
    return this.homeService.create(homeData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() homeData: UpdateHomeDto,
  ): Promise<HomeReponseDto> {
    return this.homeService.update(id, homeData);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.delete(id);
  }
}
