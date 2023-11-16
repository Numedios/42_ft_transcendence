import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt,Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt2') {
  constructor() {
    super({
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		secretOrKey: process.env.AUTH_SECRET,
	});
  }
}