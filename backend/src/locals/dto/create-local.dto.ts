import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateLocalDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do local é obrigatório' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1, { message: 'A capacidade deve ser maior que 0' })
  @IsOptional()
  capacity?: number;
}
