import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtGuard } from 'src/auth/guards/auth.guard';
import { CreatePongDto } from './pong.dto'
import { Game, User, GameStatus, Role, Prisma, messageStatus, challengeStatus, roleInGame, UserStatus  } from '@prisma/client';
import { Socket } from 'socket.io';
import { AppService } from 'src/app.service';
import { ESLint } from 'eslint';


@UseGuards(JwtGuard)
@Injectable()
export class PongService {
  constructor(private prisma: PrismaService) {}

  async createGame(creatorId: number): Promise<Game> {
    console.log("create new game")
    const tmp = await this.prisma.game.create({
        data: {
            level: 1,
            status: GameStatus.PENDING,
            players: {
                create: [{ 
                    podium: 'DRAW',
                    role: roleInGame.PLAYER,
                    userId: creatorId}]
            }
        }
    })
    console.log("NEW game: ", tmp);
    return tmp
  }

  // util
  async connectGame(userId: number, gameId: number, userRole: roleInGame): Promise<Game> {
    try {
        //console.log("userRole ", userRole)
        const connectGame = await this.prisma.game.update({
            where: { id: gameId },
            data: {
                players: {
                    connect: { userId_gameId: {
                        userId: userId,
                        gameId: gameId
                    }},
                
                }
            }
        })
        const players =  await this.prisma.usersOnGames.findUnique({ where: { userId_gameId: { userId: userId, gameId: gameId } }})
        console.log("connectGame: ", players)
        if (!connectGame)
            throw new NotFoundException(`Failed to update game ${gameId}`)
        await this.prisma.user.update({ where: { id: userId},
            data: { status: UserStatus.WAITING }
        })
        return connectGame
    } catch (error) {
        throw error.message
    }
  }

  // to play
  async playGame(userId: number, gameId: number): Promise<Game> {
    try {
        // const countUsers = await this.prisma.game.findUnique({ where: { id: gameId},
        //     include: {        
        //         _count: {
        //             select: { players:  true }
        //         }
        // }})
        const countPlayers = await this.prisma.usersOnGames.count({
            where: {
              gameId: gameId,
              role: 'PLAYER',
            },
        });
        if (!countPlayers)
            throw new NotFoundException('Game to join not found')
        if (countPlayers === 1) {
            const joinGame = await this.connectGame(userId, gameId, roleInGame.PLAYER);
            console.log("count: ", countPlayers)
            // match playing
            await this.prisma.game.update({
                where: { id: joinGame.id },
                data: { status: GameStatus.PLAYING }
            })
            // user playing
            await this.prisma.user.update({ where: { id: userId},
                data: { status: UserStatus.PLAYING }
            })
            return joinGame;
        }
        else
            throw new UnauthorizedException('error joining a game')
    } 
    catch (error) {
        throw error.message
    }
  }

  async playRandomGame(userId: number): Promise <Game> {
    try {
        const game = await this.prisma.game.findFirst({ where: { status: GameStatus.PENDING }})
        if (!game) {
            const newGame = await this.createGame(userId)
            return newGame;
        }
        console.log("GAME ICI: ", game)
        const playGame = await this.playGame(userId, game.id)
        await this.prisma.user.update({ where: { id: userId},
            data: { status: UserStatus.PLAYING }
        })
        return playGame;
    } catch (error) {
        throw error
    }
  }

  // to watch
  async watchGame(userId: number, gameId: number): Promise<Game> {
    try {
        const game = await this.prisma.game.findUnique({ where: { id: gameId, 
            status: GameStatus.PLAYING }})
        if (!game)
            throw new NotFoundException('Game to watch not found')
        const joinGame = await this.connectGame(userId, gameId, roleInGame.WATCHER);
        if (!joinGame)
        throw new NotFoundException('Failed to join game to watch')
        await this.prisma.user.update({ where: { id: userId},
            data: { status: UserStatus.WATCHING }
        })
        return joinGame;
    } catch (error) {
        throw error
    }
  }

  async getGameById(gameId: number): Promise <Game> {
    try {
        const game = await this.prisma.game.findUnique({ where: { id: gameId }})
        if (!game)
            throw new BadRequestException('Game not found')
        return game
    } catch (error) {
        throw error.message
    }
  }

  async remove(id: number): Promise<Game> {
    const deletePlayers = this.prisma.usersOnGames.deleteMany({
        where: { userId: id }})
    const transaction = await this.prisma.$transaction([deletePlayers])
    const userExists = await this.prisma.game.findUnique({
        where: { id: id },});
    if (userExists) {
        const deleteGame = this.prisma.game.delete({
            where: { id: id },});
        return deleteGame;
    } else {
        throw new Error(`Failed to remove game`);
    }
}

  

}