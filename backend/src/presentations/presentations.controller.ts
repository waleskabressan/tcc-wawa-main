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
import { PresentationsService } from './presentations.service';
import { CreatePresentationDto } from './dto/create-presentation.dto';
import { UpdatePresentationDto } from './dto/update-presentation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('presentations')
@UseGuards(JwtAuthGuard)
export class PresentationsController {
  constructor(private readonly presentationsService: PresentationsService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.PROFESSOR, Role.SECRETARIO)
  create(@Body() createPresentationDto: CreatePresentationDto) {
    return this.presentationsService.create(createPresentationDto);
  }

  @Get()
  findAll() {
    return this.presentationsService.findAll();
  }

  @Get('my-orientations')
  @UseGuards(RolesGuard)
  @Roles(Role.PROFESSOR)
  findMyOrientations(@CurrentUser('id') userId: number) {
    return this.presentationsService.findByAdvisor(userId);
  }

  @Get('my-presentations')
  @UseGuards(RolesGuard)
  @Roles(Role.ALUNO)
  findMyPresentations(@CurrentUser('id') userId: number) {
    return this.presentationsService.findByStudent(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.presentationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.PROFESSOR, Role.SECRETARIO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePresentationDto: UpdatePresentationDto,
  ) {
    return this.presentationsService.update(id, updatePresentationDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SECRETARIO)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.presentationsService.remove(id);
  }
}
