import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PresentationStatus } from '../../common/enums/presentation-status.enum';

export class CreatePresentationDto {
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'O semestre é obrigatório' })
  semester: string;

  @IsNumber()
  @IsNotEmpty({ message: 'O aluno é obrigatório' })
  studentId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'O orientador é obrigatório' })
  advisorId: number;

  @IsNumber()
  @IsOptional()
  coadvisorId?: number;

  @IsEnum(PresentationStatus)
  @IsOptional()
  status?: PresentationStatus;
}
