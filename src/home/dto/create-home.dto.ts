import { PropertyType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';

class Image {
  @IsNotEmpty()
  @IsString()
  url: string;
}

export class CreateHomeDto {
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

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => Image)
  images: Image[];
}
