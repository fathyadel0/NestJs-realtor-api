import { PropertyType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryHomeDto {
  @IsOptional()
  city: string;

  @IsOptional()
  minPrice: number;

  @IsOptional()
  maxPrice: number;

  @IsOptional()
  @IsEnum(PropertyType)
  propertyType: PropertyType;
}
