import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PresentationStatus } from '../../common/enums/presentation-status.enum';

export class UpdatePresentationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  semester?: string;

  @IsNumber()
  @IsOptional()
  studentId?: number;

  @IsNumber()
  @IsOptional()
  advisorId?: number;

  @IsNumber()
  @IsOptional()
  coadvisorId?: number;

  @IsEnum(PresentationStatus)
  @IsOptional()
  status?: PresentationStatus;
}
