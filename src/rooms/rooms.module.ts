import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomMemberEntity } from './entities/room-user.entity';
import { RoomEntity } from './entities/room.entity';
import { CommentEntity } from './entities/comment.entity';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { UsersRoomService } from '../users/usersRoom.service';
import { UserEntity } from '../users/entities/user.entity';
import { LocationsService } from '../locations/locations.service';
import { UserLocationEntity } from '../locations/entities/user-location.entity';
import { UserRoomReactionEntity } from './entities/room-user-reaction.entity';
import { RoomLocationEntity } from './entities/room-location.entity';
import { GeneralLocationEntity } from '../locations/entities/general-location.entity';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomEntity,
      RoomMemberEntity,
      UserRoomReactionEntity,
      CommentEntity,
      UserEntity,
      UserLocationEntity,
      GeneralLocationEntity,
      CommentEntity,
      RoomLocationEntity,
    ]),
  ],
  controllers: [RoomsController],
  providers: [RoomsService, UsersRoomService, CommentsService, LocationsService],
})
export class RoomsModule {}
