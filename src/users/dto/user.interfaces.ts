import { UserEntity } from '../entities/user.entity';

// Типы для TypeScript
export type UserMinimal = Pick<UserEntity, 'id' | 'login'>;
export type UserSessions = Pick<UserEntity, 'id' | 'login' | 'sessions'>;
export type UserCredentials = Pick<UserEntity, 'id' | 'login' | 'password' | 'tmpPassword'>;
export type UserPrivateInfo = Pick<
  UserEntity,
  'id' | 'login' | 'email' | 'emailVerifiedAt' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;
