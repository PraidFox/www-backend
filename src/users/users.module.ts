import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersRoomService } from './usersRoom.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  exports: [UsersService, UsersRoomService],
  controllers: [UsersController],
  providers: [UsersService, UsersRoomService],
})
export class UsersModule {}
