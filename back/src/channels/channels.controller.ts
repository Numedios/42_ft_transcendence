import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { CreateChannelDto, UpdateChannelDto, AuthChannelDto, UpdateRoleDto } from './dto';
import { UserEntity } from 'src/auth/entities/user.entity';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';
import { getUser } from '../auth/decorators/users.decorator';
import { User, messageStatus } from '@prisma/client';
import { JwtGuard } from 'src/auth/guards/auth.guard';

@UseGuards(JwtGuard)
@Controller('channel')
export class ChannelController {
  constructor(private readonly channelsService: ChannelsService) {}

  // Cree un channel
  @Post()
  create(@Body() dto: CreateChannelDto, @Request() req) {
	  return this.channelsService.createChannel(dto, req.user.id);
  }

  // Cree un channel MP et y ajoute un user
  @Post('mp/:id')
  createMP(@Param('id', ParseIntPipe) recipientId: number,
    @Body() channelDatas: CreateChannelDto,
    @getUser('id') creatorId: number) {
	  return this.channelsService.createChannelMP(recipientId, creatorId, channelDatas);
  }

  // Ajoute un user dans un channel
  @Post('join/:id')
  join(@Param('id', ParseIntPipe) channelId: number,
    @Body() joinChannelDatas: AuthChannelDto,
    @getUser('id') userId: number) {
    return this.channelsService.joinChannel(joinChannelDatas, channelId, userId);
  }

  // Retourne tout les channels
  @Get()
  async findAll() {
    const channels = await this.channelsService.findAllChannels();
    return channels;
  }

  // Retourne tout les channels PUBLIC et PROTECTED
  @Get('accessibles')
  async findAllAccessibles() {
    const channels = await this.channelsService.findAllChannelsAccessibles();
    return channels;
  }

  // Retourne un channel
  @Get(':id')
  find(@Param('id', ParseIntPipe) channelId: number,
    @getUser('id') userId: number) {
    return this.channelsService.findChannel(channelId, userId);
  }

  // Retourne un channel avec ses relations
  @Get(':id/relations')
  findWithRelations(@Param('id', ParseIntPipe) channelId: number,
    @getUser('id') userId: number) {
    return this.channelsService.findChannelWithRelations(channelId, userId);
  }

  // Retourne les sockets (string) des users
  @Get(':id/sockets')
  async findSockets(
    @Param('id', ParseIntPipe) id: number) {
    return await this.channelsService.getAllSockets(id);
  }

  // Modifie un channel
  @Patch(':id')
  update(@Param('id', ParseIntPipe) channelId: number, 
  @Body() newChannelDatas: UpdateChannelDto, 
  @getUser('id') userId: number) {
    return this.channelsService.updateChannel(channelId, newChannelDatas, userId);
  }

  // Change le role d'un user du channel
  @Patch(':channelId/role/:userTargetId')
  updateRole(@Param('channelId', ParseIntPipe) channelId: number,
    @Param('userTargetId', ParseIntPipe) userTargetId: number,
    @getUser('id') userAuthId: number,
    @Body() newRole: UpdateRoleDto) {
    return this.channelsService.updateUserRole(channelId, userTargetId, userAuthId, newRole);
  }

  // Supprime un channel
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) channelId: number) {
    return this.channelsService.remove(channelId);
	}

  // Retire un user d'un channel
  @Delete(':channelId/leave/:userTargetId')
  leave(@Param('channelId', ParseIntPipe) channelId: number,
    @Param('userTargetId', ParseIntPipe) userTargetId: number,
    @getUser('id') userAuthId: number) {
    return this.channelsService.leaveChannel(channelId, userTargetId, userAuthId);
	}
  /* soso  ajout de message  avec l'id du channel  */

  @Post(':id/message') // à accorder
async addMessage( 
  @getUser() user: User,
  @Param('id', ParseIntPipe) id: number,
  @Body('msg') msg: string, 
  @Body('msgStatus') msgStatus: messageStatus, // Ajout du paramètre msgStatus
) {
  return await this.channelsService.addContent(id, msg, user, msgStatus);
}

  /* soso obtenir tout les messages  edit : format de renvoie pas encore confirmer */

  @Get(':id/message') // a acorder
  getMessages(
    @Param('id', ParseIntPipe) id: number) {
    return this.channelsService.getAllMessage(id);
  }


/* =========================== PAS UTILISEES ================================ */

  @Patch('add/:user/in/:chan')
  addUser(@Param('user', ParseIntPipe) user: number,
  @Param('chan', ParseIntPipe) chan: number,
  @Request() member: User) {
    return this.channelsService.addUserInChannel(user, member, chan);
  }


}