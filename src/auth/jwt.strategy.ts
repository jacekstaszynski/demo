import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigurationService } from '../../src/config/configuration.service';
import { UserFacade } from '../../src/user/user.facade';
import { UserData } from './user-data.type';

export interface JwtPayload {
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userFacade: UserFacade,
    private readonly configurationService: ConfigurationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configurationService.auth0.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserData> {
    if (!payload.sub) {
      throw new HttpException('Payload is missing', HttpStatus.FORBIDDEN);
    }
    const user = await this.userFacade.findUserByEmail(payload.sub);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.FORBIDDEN);
    }

    return { email: payload.sub, name: user.name, id: user.id };
  }
}
