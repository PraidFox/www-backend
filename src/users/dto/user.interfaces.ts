import { UserEntity } from '../entities/user.entity';

export interface UserNotPassword extends Omit<UserEntity, 'password' | 'tmpPassword'> {}

export interface UserMinInfo {
  id: number;
  login: string;
}
