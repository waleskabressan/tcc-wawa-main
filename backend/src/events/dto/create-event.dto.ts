import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../../common/enums/event-type.enum';
import { ParticipantType } from '../../common/enums/participant-type.enum';

export class ParticipantDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEnum(ParticipantType)
  @IsNotEmpty()
  type: ParticipantType;
}

export class CreateEventDto {
  @IsEnum(EventType)
  @IsNotEmpty({ message: 'O tipo de evento é obrigatório' })
  type: EventType;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty({ message: 'A data de início é obrigatória' })
  startDate: string;

  @IsDateString()
  @IsNotEmpty({ message: 'A data de término é obrigatória' })
  endDate: string;

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
