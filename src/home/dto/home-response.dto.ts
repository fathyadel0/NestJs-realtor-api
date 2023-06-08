import { PropertyType, Image } from '@prisma/client';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class HomeReponseDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsNumber()
  bedrooms: number;

  @IsNotEmpty()
  @IsNumber()
  bathrooms: number;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  landSize: number;

  @IsNotEmpty()
  @IsEnum(PropertyType)
  propertyType: PropertyType;
}
