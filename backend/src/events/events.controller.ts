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
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EventType } from '../common/enums/event-type.enum';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.PROFESSOR, Role.SECRETARIO)
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('reunioes')
  findReunioes() {
    return this.eventsService.findByType(EventType.REUNIAO);
  }

  @Get('apresentacoes')
  findApresentacoes() {
    return this.eventsService.findByType(EventType.APRESENTACAO);
  }

  @Get('upcoming')
  findUpcoming(@Query('limit') limit?: number) {
    return this.eventsService.findUpcoming(limit);
  }

  @Get('my-events')
  findMyEvents(@CurrentUser('id') userId: number) {
    return this.eventsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.PROFESSOR, Role.SECRETARIO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SECRETARIO)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}
