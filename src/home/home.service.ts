import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHomeDto } from './dto/create-home.dto';
import { HomeReponseDto } from './dto/home-response.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { QueryHomeDto } from './dto/query-home.dto';
import { DecodedUser } from 'src/auth/decorator/user.decorator';

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}

  private selectedData = {
    id: true,
    address: true,
    bedrooms: true,
    bathrooms: true,
    city: true,
    price: true,
    landSize: true,
    propertyType: true,
    images: { select: { url: true }, take: 1 },
  };

  async getAll(homeQuery: QueryHomeDto): Promise<HomeReponseDto[]> {
    const homes = await this.prisma.home.findMany({
      select: this.selectedData,
      where: {
        city: homeQuery?.city,
        price: {
          gte: homeQuery.minPrice ? +homeQuery.minPrice : undefined,
          lte: homeQuery.maxPrice ? +homeQuery.maxPrice : undefined,
        },
        propertyType: homeQuery?.propertyType,
      },
    });

    if (!homes.length) {
      throw new NotFoundException('Home not found!');
    }

    return homes;
  }

  async getOne(id: number): Promise<HomeReponseDto> {
    const home = await this.prisma.home.findUnique({ where: { id }, select: this.selectedData });
    if (!home) {
      throw new NotFoundException('Home not found!');
    }
    return home;
  }

  async create(homeData: CreateHomeDto, user: DecodedUser): Promise<HomeReponseDto> {
    const home = await this.prisma.home.create({
      data: {
        address: homeData.address,
        bedrooms: homeData.bathrooms,
        bathrooms: homeData.bathrooms,
        city: homeData.city,
        price: homeData.price,
        landSize: homeData.landSize,
        propertyType: homeData.propertyType,
        userId: user.id,
      },
      select: this.selectedData,
    });

    const homeImages = homeData.images.map((image) => {
      return { ...image, homeId: +home.id };
    });

    await this.prisma.image.createMany({ data: homeImages });

    return home;
  }

  async update(id: number, homeData: UpdateHomeDto): Promise<HomeReponseDto> {
    await this.getOne(id);
    return await this.prisma.home.update({
      where: { id },
      data: {
        address: homeData.address,
        bedrooms: homeData.bathrooms,
        bathrooms: homeData.bathrooms,
        city: homeData.city,
        price: homeData.price,
        landSize: homeData.landSize,
        propertyType: homeData.propertyType,
      },
      select: this.selectedData,
    });
  }

  async delete(id: number): Promise<HomeReponseDto> {
    await this.getOne(id);
    await this.prisma.image.deleteMany({ where: { homeId: id } });
    return await this.prisma.home.delete({ where: { id }, select: this.selectedData });
  }

  async getUserIdByHomeId(id: number) {
    const home = await this.prisma.home.findUnique({ where: { id } });
    return home.userId;
  }
}
