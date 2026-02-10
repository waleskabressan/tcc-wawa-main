import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Local } from './entities/local.entity';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';

@Injectable()
export class LocalsService {
  constructor(
    @InjectRepository(Local)
    private readonly localsRepository: Repository<Local>,
  ) { }

  async create(createLocalDto: CreateLocalDto): Promise<Local> {
    const existingLocal = await this.localsRepository.findOne({
      where: { name: createLocalDto.name },
    });

    if (existingLocal) {
      throw new ConflictException('Já existe um local com este nome');
    }

    const local = this.localsRepository.create(createLocalDto);
    return this.localsRepository.save(local);
  }

  async findAll(): Promise<Local[]> {
    return this.localsRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findActive(): Promise<Local[]> {
    return this.localsRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Local> {
    const local = await this.localsRepository.findOne({ where: { id } });

    if (!local) {
      throw new NotFoundException(`Local com ID ${id} não encontrado`);
    }

    return local;
  }

  async update(id: number, updateLocalDto: UpdateLocalDto): Promise<Local> {
    const local = await this.findOne(id);

    if (updateLocalDto.name && updateLocalDto.name !== local.name) {
      const existingLocal = await this.localsRepository.findOne({
        where: { name: updateLocalDto.name },
      });

      if (existingLocal) {
        throw new ConflictException('Já existe um local com este nome');
      }
    }

    Object.assign(local, updateLocalDto);
    return this.localsRepository.save(local);
  }

  async remove(id: number): Promise<void> {
    const local = await this.findOne(id);
    await this.localsRepository.remove(local);
  }
}
