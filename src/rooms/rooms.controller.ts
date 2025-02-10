import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { UsersRoomService } from '../users/usersRoom.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/create-room.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { CreateLocationReactionDto, UpdateLocationReactionDto } from './dto/create-location-reaction.dto';

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
    console.log('body', body);
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

  @Patch(':roomId/addComment')
  async addComment(@Body() commentDto: CreateCommentDto) {
    await this.roomsService.createComment(commentDto);
  }

  @Patch(':roomId/updateComment')
  async updateComment(@Body() commentDto: UpdateCommentDto) {
    await this.roomsService.updateComment(commentDto);
  }

  @Delete(':roomId/updateComment/:commentId')
  async deleteComment(@Param('commentId') commentId: number) {
    await this.roomsService.deleteComment(commentId);
  }

  @Post(':roomId/addReaction')
  async createResponseLocation(@Body() body: CreateLocationReactionDto) {
    await this.roomsService.createReaction(body);
  }

  @Patch(':roomId/updateReaction')
  async updateResponseLocations(@Body() body: UpdateLocationReactionDto) {
    await this.roomsService.updateReaction(body);
  }
}
