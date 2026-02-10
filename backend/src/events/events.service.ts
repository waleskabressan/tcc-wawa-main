import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventParticipant } from './entities/event-participant.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { LocalsService } from '../locals/locals.service';
import { PresentationsService } from '../presentations/presentations.service';
import { EventType } from '../common/enums/event-type.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(EventParticipant)
    private readonly participantsRepository: Repository<EventParticipant>,
    private readonly localsService: LocalsService,
    private readonly presentationsService: PresentationsService,
  ) { }

  async create(createEventDto: CreateEventDto): Promise<Event> {
    // Validar datas
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('A data de término deve ser posterior à data de início');
    }

    // Validar local (se informado)
    if (createEventDto.localId) {
      await this.localsService.findOne(createEventDto.localId);

      // Verificar conflito de horário no local
      const conflictingEvent = await this.eventsRepository.findOne({
        where: {
          localId: createEventDto.localId,
          startDate: LessThanOrEqual(endDate),
          endDate: MoreThanOrEqual(startDate),
        },
      });

      if (conflictingEvent) {
        throw new BadRequestException('Já existe um evento agendado neste local para este horário');
      }
    }

    // Validar presentation (se informado)
    if (createEventDto.presentationId) {
      await this.presentationsService.findOne(createEventDto.presentationId);
    }

    const { participants, ...eventData } = createEventDto;

    const event = this.eventsRepository.create({
      ...eventData,
      startDate,
      endDate,
    });

    const savedEvent = await this.eventsRepository.save(event);

    // Adicionar participantes
    if (participants && participants.length > 0) {
      const eventParticipants = participants.map((p) =>
        this.participantsRepository.create({
          eventId: savedEvent.id,
          userId: p.userId,
          type: p.type,
        }),
      );
      await this.participantsRepository.save(eventParticipants);
    }

    return this.findOne(savedEvent.id);
  }

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find({
      order: { startDate: 'ASC' },
    });
  }

  async findByType(type: EventType): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { type },
      order: { startDate: 'ASC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return this.eventsRepository.find({
      where: {
        startDate: Between(startDate, endDate),
      },
      order: { startDate: 'ASC' },
    });
  }

  async findByUser(userId: number): Promise<Event[]> {
    const participants = await this.participantsRepository.find({
      where: { userId },
      relations: ['event'],
    });

    return participants.map((p) => p.event);
  }

  async findUpcoming(limit = 10): Promise<Event[]> {
    return this.eventsRepository.find({
      where: {
        startDate: MoreThanOrEqual(new Date()),
      },
      order: { startDate: 'ASC' },
      take: limit,
    });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Evento com ID ${id} não encontrado`);
    }

    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    const { participants, ...eventData } = updateEventDto;

    // Validar datas
    if (eventData.startDate || eventData.endDate) {
      const startDate = eventData.startDate ? new Date(eventData.startDate) : event.startDate;
      const endDate = eventData.endDate ? new Date(eventData.endDate) : event.endDate;

      if (endDate <= startDate) {
        throw new BadRequestException('A data de término deve ser posterior à data de início');
      }

      if (eventData.startDate) {
        (eventData as any).startDate = startDate;
      }
      if (eventData.endDate) {
        (eventData as any).endDate = endDate;
      }
    }

    // Validar local (se alterado)
    if (eventData.localId && eventData.localId !== event.localId) {
      await this.localsService.findOne(eventData.localId);
    }

    // Validar presentation (se alterado)
    if (eventData.presentationId && eventData.presentationId !== event.presentationId) {
      await this.presentationsService.findOne(eventData.presentationId);
    }

    Object.assign(event, eventData);
    await this.eventsRepository.save(event);

    // Atualizar participantes (se informados)
    if (participants) {
      // Remover participantes antigos
      await this.participantsRepository.delete({ eventId: id });

      // Adicionar novos participantes
      if (participants.length > 0) {
        const eventParticipants = participants.map((p) =>
          this.participantsRepository.create({
            eventId: id,
            userId: p.userId,
            type: p.type,
          }),
        );
        await this.participantsRepository.save(eventParticipants);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
  }
}
