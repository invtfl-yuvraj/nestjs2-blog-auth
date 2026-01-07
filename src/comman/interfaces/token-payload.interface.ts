import { Role } from '../../../generated/prisma/enums';

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
