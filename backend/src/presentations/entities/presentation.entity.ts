import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PresentationStatus } from '../../common/enums/presentation-status.enum';

@Entity('presentations')
export class Presentation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20 })
  semester: string; // Ex: "1/25", "2/25"

  @Column({
    type: 'enum',
    enum: PresentationStatus,
    default: PresentationStatus.PENDING,
  })
  status: PresentationStatus;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'advisor_id' })
  advisor: User;

  @Column({ name: 'advisor_id' })
  advisorId: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'coadvisor_id' })
  coadvisor: User;

  @Column({ name: 'coadvisor_id', nullable: true })
  coadvisorId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
