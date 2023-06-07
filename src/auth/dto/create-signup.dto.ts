import { UserType } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';
import { PasswordValidation, PasswordValidationRequirement } from 'class-validator-password-check';

var passwordRequirement: PasswordValidationRequirement = {
  mustContainLowerLetter: true,
  mustContainNumber: true,
  mustContainSpecialCharacter: true,
  mustContainUpperLetter: true,
};

export class CreateSignupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Validate(PasswordValidation, [passwordRequirement])
  password: string;

  @IsOptional()
  @IsEnum(UserType)
  type: UserType;

  @IsOptional()
  @IsString()
  productKey: string;
}
