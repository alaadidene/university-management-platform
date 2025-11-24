import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsenceModule } from './absence/absence.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    // Ensure the service picks up its local .env even when started from a different cwd
    ConfigModule.forRoot({ isGlobal: true, envFilePath: join(__dirname, '..', '.env') }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'university_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // IMPORTANT: synchronize must be false for production-like environments.
      // It was enabled during local testing to create the schema quickly.
      // Use migrations to manage schema changes and set synchronize: false.
      synchronize: false
    }),
    AbsenceModule,
    AttendanceModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
