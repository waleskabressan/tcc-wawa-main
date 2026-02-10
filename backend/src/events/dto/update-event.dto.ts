import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../../common/enums/event-type.enum';
import { ParticipantDto } from './create-event.dto';

export class UpdateEventDto {
  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  presentationId?: number;

  @IsNumber()
  @IsOptional()
  localId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  @IsOptional()
  participants?: ParticipantDto[];
}
