import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { UsersRoomService } from '../users/usersRoom.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/create-room.dto';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly usersRoomService: UsersRoomService,
  ) {}

  @Get(':id')
  async getRoom(@Param('id') id: number) {
    return this.roomsService.getRoom(id);
  }

  @Get('myRoomsIsAuthor/:id')
  async getMyRoomsIsAuthor(@Param('id') id: number) {
    return this.usersRoomService.getMyRoomsIsAuthor(id);
  }

  @Get('myRoomsIsMember/:id')
  async getMyRoomsIsMember(@Param('id') id: number) {
    return this.usersRoomService.getMyRoomsIsMember(id);
  }

  @Get(':roomId/access/:userId')
  async accessCheck(@Param('roomId') roomId: number, @Param('userId') userId: number) {
    return this.roomsService.accessCheck(userId, roomId);
  }

  @Post()
  async create(@Body() body: CreateRoomDto) {
    return this.roomsService.createRoom(body);
  }

  @Patch('update')
  async update(@Body() body: UpdateRoomDto) {
    return this.roomsService.updateRoom(body);
  }

  @Delete('delete')
  async delete() {}

  @Patch('restore')
  async restore() {}

  @Patch('addComment')
  async addComment() {}

  @Patch('updateComment')
  async updateComment() {}

  @Delete('deleteComment')
  async deleteComment() {}

  @Patch('restoreComment')
  async restoreComment() {}
}
