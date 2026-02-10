import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Presentation } from '../../presentations/entities/presentation.entity';
import { Local } from '../../locals/entities/local.entity';
import { EventType } from '../../common/enums/event-type.enum';
import { EventParticipant } from './event-participant.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  type: EventType;

  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  @ManyToOne(() => Presentation, { eager: true, nullable: true })
  @JoinColumn({ name: 'presentation_id' })
  presentation: Presentation;

  @Column({ name: 'presentation_id', nullable: true })
  presentationId: number;

  @ManyToOne(() => Local, { eager: true, nullable: true })
  @JoinColumn({ name: 'local_id' })
  local: Local;

  @Column({ name: 'local_id', nullable: true })
  localId: number;

  @OneToMany(() => EventParticipant, (participant) => participant.event, {
    eager: true,
    cascade: true,
  })
  participants: EventParticipant[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
