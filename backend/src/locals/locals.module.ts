import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalsService } from './locals.service';
import { LocalsController } from './locals.controller';
import { Local } from './entities/local.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Local])],
  controllers: [LocalsController],
  providers: [LocalsService],
  exports: [LocalsService],
})
export class LocalsModule { }
