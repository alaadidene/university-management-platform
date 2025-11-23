import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmploiDuTempsModule } from './emploi-du-temps/emploi-du-temps.module';
import { AdminModule } from './admin/admin.module';
import { join } from 'path';

@Module({
  imports: [
    // Load service-local .env to allow each developer to use different ports/credentials
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASS || process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'university_db',
      autoLoadEntities: true,
      // keep synchronize during local development; set to false for production/migrations
      synchronize: process.env.TYPEORM_SYNC === 'true' || true,
    }),
    AdminModule,
    EmploiDuTempsModule,
  ],
})
export class AppModule {}
