import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Matiere } from './entities/matiere.entity';

@Injectable()
export class MatiereService {
  constructor(
    @InjectRepository(Matiere)
    private readonly matiereRepo: Repository<Matiere>,
  ) {}

  async findOneWithEnseignants(id: number): Promise<Matiere> {
    const matiere = await this.matiereRepo.findOne({ where: { id } });
    if (!matiere) throw new NotFoundException(`Matière #${id} non trouvée`);
    return matiere;
  }

  async isTeacherOfMatiere(matiereId: number, enseignantId: number): Promise<boolean> {
    const matiere = await this.matiereRepo.findOne({ 
      where: { id: matiereId },
      relations: ['enseignants']
    });
    if (!matiere) throw new NotFoundException(`Matière #${matiereId} non trouvée`);
    
    console.log('🔍 Validation matière-enseignant:', {
      matiereId,
      enseignantId,
      enseignants: (matiere as any).enseignants?.map((e: any) => ({ id: e.id, nom: e.nom }))
    });
    
    const enseignants = (matiere as any).enseignants || [];
    const isValid = enseignants.some((e: any) => Number(e.id) === Number(enseignantId));
    console.log('  ✅ Résultat validation:', isValid);
    
    return isValid;
  }
}
