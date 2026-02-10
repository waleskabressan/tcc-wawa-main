import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateLocalDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1, { message: 'A capacidade deve ser maior que 0' })
  @IsOptional()
  capacity?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
