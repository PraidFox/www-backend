import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsIsMemberUserEntity } from './entities/room-user';
import { RoomEntity } from './entities/room.entity';
import { CommentEntity } from './entities/comment.entity';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { UsersRoomService } from '../users/usersRoom.service';
import { UserEntity } from '../users/entities/user.entity';
import { LocationsService } from '../locations/locations.service';
import { LocationEntity } from '../locations/entities/location.entity';
import { UserRoomReactionEntity } from './entities/room-user-reaction.entity';
import { RoomLocationEntity } from './entities/room-location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomEntity,
      RoomsIsMemberUserEntity,
      UserRoomReactionEntity,
      CommentEntity,
      UserEntity,
      LocationEntity,
      CommentEntity,
      RoomLocationEntity,
    ]),
  ],
  controllers: [RoomsController],
  providers: [RoomsService, UsersRoomService, LocationsService],
})
export class RoomsModule {}
