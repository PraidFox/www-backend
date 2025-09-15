import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CommentsService } from './comments.service';
import { UsersRoomService } from '../users/usersRoom.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/create-room.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { UpdateUserReactionDto } from './dto/create-user-reaction.dto';
import { Request } from 'express';
import { DecodedAccessToken } from '../utils/interfaces';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly commentsService: CommentsService,
    private readonly usersRoomService: UsersRoomService,
  ) {}

  @Get(':roomId')
  @ApiOperation({ summary: 'Возвращает минимальную информацию по комнате' })
  async getRoom(@Param('roomId') roomId: number) {
    return this.roomsService.getRoom(roomId);
  }

  @Get(':roomId/full')
  @ApiOperation({ summary: 'Возвращает полную информацию по комнате' })
  async getRoomFull(@Param('roomId') roomId: number) {
    return this.roomsService.getRoomFull(roomId);
  }

  //TODO а зачем передавать idUser ведь если пользователь зарегистрирован или гость, в запросе query передается id
  @Get('myRoomsIsAuthor/:idUser')
  async getMyRoomsIsAuthor(@Param('idUser') idUser: number) {
    return this.usersRoomService.getMyRoomsIsAuthor(idUser);
  }

  //TODO а зачем передавать idUser ведь если пользователь зарегистрирован или гость, в запросе query передается id
  @Get('myRoomsIsMember/:idUser')
  async getMyRoomsIsMember(@Param('idUser') idUser: number) {
    return this.usersRoomService.getMyRoomsIsMember(idUser);
  }

  //TODO удалить? Ведь фронтент не будет проверять доступна комната или нет. Это делает бекенд.
  @Get(':roomId/access/:userId')
  async accessCheck(@Param('roomId') roomId: number, @Param('userId') userId: number) {
    return this.roomsService.accessCheck(userId, roomId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() crd: CreateRoomDto, @Req() req: Request) {
    const { id } = req.user as DecodedAccessToken;
    return this.roomsService.createRoom(crd, id);
  }

  @Patch()
  async update(@Body() body: UpdateRoomDto, @Req() req: Request) {
    const { id } = req.user as DecodedAccessToken;
    return this.roomsService.updateRoom(body, id);
  }

  @Delete(':roomId')
  async delete(@Param('roomId') roomId: number) {
    await this.roomsService.deleteRoom(roomId);
  }

  @Post('createComment')
  async addComment(@Body() commentDto: CreateCommentDto) {
    await this.commentsService.createComment(commentDto);
  }

  @Patch('updateComment')
  async updateComment(@Body() commentDto: UpdateCommentDto) {
    await this.commentsService.updateComment(commentDto);
  }

  @Patch('updateReaction')
  async updateResponseLocations(@Body() body: UpdateUserReactionDto) {
    await this.roomsService.updateReaction(body);
  }
}
