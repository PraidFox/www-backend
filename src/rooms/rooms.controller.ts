import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { UsersRoomService } from '../users/usersRoom.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/create-room.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { UpdateUserReactionDto } from './dto/create-user-reaction.dto';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly usersRoomService: UsersRoomService,
  ) {}

  @Get(':roomId')
  async getRoom(@Param('roomId') roomId: number) {
    return this.roomsService.getRoom(roomId);
  }

  @Get(':roomId/full')
  async getRoomFull(@Param('roomId') roomId: number) {
    return this.roomsService.getRoomFull(roomId);
  }

  @Get('myRoomsIsAuthor/:idUser')
  async getMyRoomsIsAuthor(@Param('idUser') idUser: number) {
    return this.usersRoomService.getMyRoomsIsAuthor(idUser);
  }

  @Get('myRoomsIsMember/:idUser')
  async getMyRoomsIsMember(@Param('idUser') idUser: number) {
    return this.usersRoomService.getMyRoomsIsMember(idUser);
  }

  @Get(':roomId/access/:userId')
  async accessCheck(@Param('roomId') roomId: number, @Param('userId') userId: number) {
    return this.roomsService.accessCheck(userId, roomId);
  }

  @Post()
  async create(@Body() body: CreateRoomDto) {
    return this.roomsService.createRoom(body);
  }

  @Patch()
  async update(@Body() body: UpdateRoomDto) {
    return this.roomsService.updateRoom(body);
  }

  @Delete(':roomId')
  async delete(@Param('roomId') roomId: number) {
    await this.roomsService.deleteRoom(roomId);
  }

  @Post('createComment')
  async addComment(@Body() commentDto: CreateCommentDto) {
    await this.roomsService.createComment(commentDto);
  }

  @Patch('updateComment')
  async updateComment(@Body() commentDto: UpdateCommentDto) {
    await this.roomsService.updateComment(commentDto);
  }

  @Patch('updateReaction')
  async updateResponseLocations(@Body() body: UpdateUserReactionDto) {
    await this.roomsService.updateReaction(body);
  }
}
