import { Role } from '../../../generated/prisma/enums';

export class JwtPayloadDto {
  userId: string;
  email: string;
  role: Role;
}
