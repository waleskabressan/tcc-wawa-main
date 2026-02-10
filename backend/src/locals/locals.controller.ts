import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { LocalsService } from './locals.service';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('locals')
@UseGuards(JwtAuthGuard)
export class LocalsController {
  constructor(private readonly localsService: LocalsService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SECRETARIO)
  create(@Body() createLocalDto: CreateLocalDto) {
    return this.localsService.create(createLocalDto);
  }

  @Get()
  findAll() {
    return this.localsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.localsService.findActive();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.localsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SECRETARIO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLocalDto: UpdateLocalDto,
  ) {
    return this.localsService.update(id, updateLocalDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SECRETARIO)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.localsService.remove(id);
  }
}
