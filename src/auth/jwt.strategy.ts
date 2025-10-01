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
    // REAL AUTH CONFIGURATION
    // super({
    //   secretOrKeyProvider: passportJwtSecret({
    //     cache: true,
    //     rateLimit: true,
    //     jwksRequestsPerMinute: 5,
    //     jwksUri: `${configurationService.auth0.issuerUrl}.well-known/jwks.json`,
    //   }),
    //   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    //   audience: configurationService.auth0.audience,
    //   issuer: configurationService.auth0.issuerUrl,
    //   algorithms: ['RS256'],
    //   passReqToCallback: true,
    // });
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

    // TODO: check if user exists / if not create or any logic needed
    return { email: payload.sub, name: user.name, id: user.id };
  }
}
