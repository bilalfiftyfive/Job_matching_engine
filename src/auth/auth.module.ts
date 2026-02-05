import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret =
          config.get<string>('JWT_SECRET') ?? 'dev_secret_change_me';
        const rawExpiresIn = config.get<string>('JWT_EXPIRES_IN');
        const expiresIn =
          rawExpiresIn && /^\d+$/.test(rawExpiresIn)
            ? Number(rawExpiresIn)
            : (rawExpiresIn as StringValue | undefined);

        return {
          secret,
          signOptions: { expiresIn: expiresIn ?? '1d' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
