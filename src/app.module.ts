import { ArcjetModule, ArcjetGuard, fixedWindow, shield } from '@arcjet/nest';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './lib/database/prisma.module.js';
import { PrismaService } from './lib/database/prisma.service.js';
import { createAuth } from './lib/auth/auth.js';
import { UserModule } from './user/user.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule.forRootAsync({
      imports: [ConfigModule, PrismaModule],
      inject: [ConfigService, PrismaService],
      useFactory: async (
        configService: ConfigService,
        prismaService: PrismaService,
      ) => ({
        auth: createAuth(
          prismaService,
          configService.getOrThrow('BETTER_AUTH_URL'),
        ),
        bodyParser: {
          json: { limit: '2mb' },
          urlencoded: { limit: '2mb', extended: true },
          rawBody: true,
        },
      }),
    }),
    ArcjetModule.forRootAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        key: configService.getOrThrow('ARCJET_KEY'),
        rules: [
          shield({ mode: 'LIVE' }),
          fixedWindow({
            mode: 'LIVE',
            max: 10,
            window: '60s',
          }),
        ],
      }),
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
  ],
})
export class AppModule {}
