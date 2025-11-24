import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvenementService } from './evenement.service';
import { EvenementController } from './evenement.controller';
import { Evenement } from './entities/evenement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evenement])],
  controllers: [EvenementController],
  providers: [EvenementService],
  exports: [EvenementService],
})
export class EvenementModule {}