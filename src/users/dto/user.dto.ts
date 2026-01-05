import { User } from '../../../generated/prisma/client';

export type UserEntity = User;

export type PublicUser = Omit<User, 'password'>;
