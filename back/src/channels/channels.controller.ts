import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { CreateChannelDto, UpdateChannelDto, AuthChannelDto } from './dto';
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

  @Post()
  create(@Body() dto: CreateChannelDto, @Request() req) {
	  return this.channelsService.createChannel(dto, req.user);
  }

  @Post('mp/:id')
  createMP(@Param('id', ParseIntPipe) idRecipient: number,
    @Body() dto: CreateChannelDto,
    @Request() req) {
	  return this.channelsService.createChannelMP(idRecipient, dto, req.user);
  }

  @Post('join')
  join(@Body() dto: AuthChannelDto, @Request() req) {
    return this.channelsService.joinChannel(dto, req.user);
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
  


  @Get()
  async findAll() {
    const channels = await this.channelsService.findAllChannels();
    return channels;
  }

  /* soso obtenir tout les id des users d'un channel avec son id*/

  @Get(':id/userId')
  async getAllUserId(
    @Param('id', ParseIntPipe) id: number,
  ){
    return await this.channelsService.getAllUserId(id);;
  }


  // RQPR channel par son id => inutile
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.channelsService.findOneChannel(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, 
  @Body() dto: UpdateChannelDto, 
  @getUser() member: User) {
    return this.channelsService.updateChannel(id, dto, member);
  }

  @Patch('add/:user/in/:chan')
  addUser(@Param('user', ParseIntPipe) user: number,
  @Param('chan', ParseIntPipe) chan: number,
  @Request() member: User) {
    return this.channelsService.addUserInChannel(user, member, chan);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.channelsService.remove(id);
	}

  @Delete('leave/:id')
  leave(@Param('id', ParseIntPipe) channId: number,
  @getUser() member: User) {
    return this.channelsService.leaveChannel(member, channId);
	}

}