import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { EventParticipant } from './entities/event-participant.entity';
import { LocalsModule } from '../locals/locals.module';
import { PresentationsModule } from '../presentations/presentations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventParticipant]),
    LocalsModule,
    PresentationsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule { }
