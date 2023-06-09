import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UserType } from '@prisma/client';

export class DecodedUser {
  id: number;
  email: string;
  type: UserType;
  iat: number;
  exp: number;
}

export const User = createParamDecorator((data, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.user;
});
