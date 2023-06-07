import { UserType } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateProductKeyDto {
  @IsNotEmpty()
  @IsEmail()
  email: String;

  @IsNotEmpty()
  @IsEnum(UserType)
  type: UserType;
}
