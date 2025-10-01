import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigurationModule } from '../../src/config/configuration.module';
import { ConfigurationService } from '../../src/config/configuration.service';
import { UserModule } from '../../src/user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    ConfigurationModule,
    UserModule,
    SessionModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configurationService: ConfigurationService) => ({
        secret: configurationService.auth0.secret,
        // TODO: move it to config
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
