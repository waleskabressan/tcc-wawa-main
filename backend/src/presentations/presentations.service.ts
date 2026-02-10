import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Presentation } from './entities/presentation.entity';
import { CreatePresentationDto } from './dto/create-presentation.dto';
import { UpdatePresentationDto } from './dto/update-presentation.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class PresentationsService {
  constructor(
    @InjectRepository(Presentation)
    private readonly presentationsRepository: Repository<Presentation>,
    private readonly usersService: UsersService,
  ) { }

  async create(createPresentationDto: CreatePresentationDto): Promise<Presentation> {
    // Validar aluno
    const student = await this.usersService.findOne(createPresentationDto.studentId);
    if (student.role !== Role.ALUNO) {
      throw new BadRequestException('O usuário selecionado não é um aluno');
    }

    // Validar orientador
    const advisor = await this.usersService.findOne(createPresentationDto.advisorId);
    if (advisor.role !== Role.PROFESSOR) {
      throw new BadRequestException('O orientador deve ser um professor');
    }

    // Validar coorientador (se informado)
    if (createPresentationDto.coadvisorId) {
      const coadvisor = await this.usersService.findOne(createPresentationDto.coadvisorId);
      if (coadvisor.role !== Role.PROFESSOR) {
        throw new BadRequestException('O coorientador deve ser um professor');
      }
    }

    const presentation = this.presentationsRepository.create(createPresentationDto);
    return this.presentationsRepository.save(presentation);
  }

  async findAll(): Promise<Presentation[]> {
    return this.presentationsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByAdvisor(advisorId: number): Promise<Presentation[]> {
    return this.presentationsRepository.find({
      where: [
        { advisorId },
        { coadvisorId: advisorId },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStudent(studentId: number): Promise<Presentation[]> {
    return this.presentationsRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Presentation> {
    const presentation = await this.presentationsRepository.findOne({
      where: { id },
    });

    if (!presentation) {
      throw new NotFoundException(`Tema com ID ${id} não encontrado`);
    }

    return presentation;
  }

  async update(
    id: number,
    updatePresentationDto: UpdatePresentationDto,
  ): Promise<Presentation> {
    const presentation = await this.findOne(id);

    // Validar aluno (se alterado)
    if (updatePresentationDto.studentId && updatePresentationDto.studentId !== presentation.studentId) {
      const student = await this.usersService.findOne(updatePresentationDto.studentId);
      if (student.role !== Role.ALUNO) {
        throw new BadRequestException('O usuário selecionado não é um aluno');
      }
    }

    // Validar orientador (se alterado)
    if (updatePresentationDto.advisorId && updatePresentationDto.advisorId !== presentation.advisorId) {
      const advisor = await this.usersService.findOne(updatePresentationDto.advisorId);
      if (advisor.role !== Role.PROFESSOR) {
        throw new BadRequestException('O orientador deve ser um professor');
      }
    }

    // Validar coorientador (se alterado)
    if (updatePresentationDto.coadvisorId) {
      const coadvisor = await this.usersService.findOne(updatePresentationDto.coadvisorId);
      if (coadvisor.role !== Role.PROFESSOR) {
        throw new BadRequestException('O coorientador deve ser um professor');
      }
    }

    Object.assign(presentation, updatePresentationDto);
    return this.presentationsRepository.save(presentation);
  }

  async remove(id: number): Promise<void> {
    const presentation = await this.findOne(id);
    await this.presentationsRepository.remove(presentation);
  }
}
