import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './config.types';

@Injectable()
export class ConfigurationService {
  readonly port: number;
  readonly env: Env;

  readonly database: {
    url: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  readonly auth0: {
    secret: string;

    // FOR REAL AUTH0 APPLICATION
    // domain: string;
    // audience: string;
    // issuerUrl: string;
    // client_id: string;
    // redirect_url: string;
  };

  constructor(private configService: ConfigService) {
    this.auth0 = {
      secret: this.configService.getOrThrow('JWT_SECRET'),
    };
    this.database = {
      url: this.configService.getOrThrow('DB_URL'),
      port: this.configService.getOrThrow('DB_PORT'),
      name: this.configService.getOrThrow('DB_NAME'),
      user: this.configService.getOrThrow('DB_USER'),
      password: this.configService.getOrThrow('DB_PASSWORD'),
    };
  }
}
