import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evenement } from './entities/evenement.entity';
import { CreateEvenementDto } from './dto/create-evenement.dto';
import { UpdateEvenementDto } from './dto/update-evenement.dto';

@Injectable()
export class EvenementService {
  constructor(
    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,
  ) {}

  async create(createEvenementDto: CreateEvenementDto): Promise<Evenement> {
    const evenement = this.evenementRepository.create(createEvenementDto);
    return this.evenementRepository.save(evenement);
  }

  async findAll(): Promise<Evenement[]> {
    return this.evenementRepository.find({ order: { dateDebut: 'ASC' } });
  }

  async findOne(id: number): Promise<Evenement> {
    const evenement = await this.evenementRepository.findOne({ where: { id } });
    if (!evenement) {
      throw new NotFoundException('Événement introuvable');
    }
    return evenement;
  }

  async update(id: number, updateEvenementDto: UpdateEvenementDto): Promise<Evenement> {
    const evenement = await this.findOne(id);
    Object.assign(evenement, updateEvenementDto);
    return this.evenementRepository.save(evenement);
  }

  async remove(id: number): Promise<void> {
    const evenement = await this.findOne(id);
    await this.evenementRepository.remove(evenement);
  }
}