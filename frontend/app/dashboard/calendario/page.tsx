'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  type CalendarEventExternal,
  createCalendar,
  createViewDay,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar';
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createResizePlugin } from '@schedule-x/resize';
import { ScheduleXCalendar } from '@schedule-x/react';
import { createTimezoneSelectPlugin, translations as timezoneTranslations } from '@schedule-x/timezone-select'
import '@schedule-x/theme-default/dist/index.css';
import 'temporal-polyfill/global';
import { Temporal } from 'temporal-polyfill';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';

import { Event, EventType, UpdateEventDto } from '@/types';
import { eventsService } from '@/lib/services';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type ViewType = 'day' | 'week' | 'month-grid';

// Configuração de calendários (cores por tipo de evento)
const SCHEDULE_CALENDARS_CONFIG = {
  reuniao: {
    colorName: 'reuniao',
    lightColors: {
      main: '#3b82f6',
      container: '#dbeafe',
      onContainer: '#1e40af',
    },
    darkColors: {
      main: '#60a5fa',
      container: '#1e3a5f',
      onContainer: '#bfdbfe',
    },
  },
  apresentacao: {
    colorName: 'apresentacao',
    lightColors: {
      main: '#10b981',
      container: '#d1fae5',
      onContainer: '#065f46',
    },
    darkColors: {
      main: '#34d399',
      container: '#064e3b',
      onContainer: '#a7f3d0',
    },
  },
};

// Configuração padrão do calendário
const DEFAULT_SCHEDULE_CONFIG = {
  locale: 'pt-BR',
  firstDayOfWeek: 7, // Domingo
  dayBoundaries: {
    start: '07:00',
    end: '22:00',
  },
};

export default function CalendarioPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<ViewType>('week');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Plugins do calendário
  const [calendarControls] = useState(() => createCalendarControlsPlugin());
  const [dragAndDropPlugin] = useState(() => createDragAndDropPlugin());
  const [eventModalPlugin] = useState(() => createEventModalPlugin());
  const [resizePlugin] = useState(() => createResizePlugin());

  // Detectar tema dark
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detectar tema inicial
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();

    // Observer para mudanças de tema
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Carregar eventos
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const eventsData = await eventsService.findAll();
      setEvents(eventsData);
    } catch (error) {
      toast.error('Erro ao carregar eventos');
    } finally {
      setIsLoading(false);
    }
  };

  // Converter eventos para o formato do schedule-x
  const calendarEvents: CalendarEventExternal[] = useMemo(() => {
    if (!events.length) return [];

    return events.map((event) => ({
      id: event.id.toString(),
      title: event.title || event.presentation?.title || 'Sem título',
      start: Temporal.Instant.from(event.startDate).subtract({ hours: 3 }).toZonedDateTimeISO('America/Sao_Paulo'),
      end: Temporal.Instant.from(event.endDate).subtract({ hours: 3 }).toZonedDateTimeISO('America/Sao_Paulo'),
      calendarId: event.type,
      // Dados extras para usar no modal
      _customData: {
        event,
        description: event.description,
        local: event.local?.name,
        participants: event.participants,
        presentation: event.presentation,
      },
    }));
  }, [events]);

  // Criar instância do calendário
  const calendarApp = useMemo(() => {
    return createCalendar({
      ...DEFAULT_SCHEDULE_CONFIG,
      calendars: SCHEDULE_CALENDARS_CONFIG,
      isDark,
      defaultView: currentView,
      views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createTimezoneSelectPlugin()],
      plugins: [calendarControls, dragAndDropPlugin, eventModalPlugin, resizePlugin],
      events: calendarEvents,
      callbacks: {
        onEventUpdate: async (updatedEvent) => {
          await handleUpdateEvent(updatedEvent);
        },
        onEventClick: (clickedEvent) => {
          console.log('Evento clicado:', clickedEvent);
        },
      },
    });
  }, [
    calendarEvents,
    isDark,
    calendarControls,
    dragAndDropPlugin,
    eventModalPlugin,
    resizePlugin,
    currentView,
  ]);

  // Atualizar evento via drag-and-drop ou resize
  const handleUpdateEvent = async (updatedEvent: CalendarEventExternal) => {
    try {
      const startDateTime = `${updatedEvent.start.toString().split('+')[0]}Z`;
      const endDateTime = `${updatedEvent.end.toString().split('+')[0]}Z`;

      const originalEvent = events.find((e) => e.id.toString() === updatedEvent.id);
      if (!originalEvent) {
        toast.error('Evento original não encontrado');
        return;
      }

      const updateData: UpdateEventDto = {
        startDate: startDateTime,
        endDate: endDateTime,
      };

      await eventsService.update(originalEvent.id, updateData);
      toast.success('Evento atualizado com sucesso!');
      loadEvents();
    } catch (error) {
      toast.error('Erro ao atualizar evento');
      loadEvents(); // Recarregar para reverter mudanças visuais
    }
  };

  // Handlers de navegação
  const handleViewChange = (view: string) => {
    setCurrentView(view as ViewType);
    calendarControls.setView(view);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      calendarControls.setDate(
        Temporal.PlainDate.from(date.toISOString().split('T')[0])
      );
      setIsDatePickerOpen(false);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    calendarControls.setDate(
      Temporal.PlainDate.from(today.toISOString().split('T')[0])
    );
  };

  const handleNext = () => {
    const view = calendarControls.getView();
    let newDate: Temporal.PlainDate;

    if (view === 'day') {
      newDate = calendarControls.getDate().add({ days: 1 });
    } else if (view === 'week') {
      newDate = calendarControls.getDate().add({ weeks: 1 });
    } else {
      newDate = calendarControls.getDate().add({ months: 1 });
    }

    calendarControls.setDate(newDate);
    setCurrentDate(new Date(newDate.toString()));
  };

  const handlePrevious = () => {
    const view = calendarControls.getView();
    let newDate: Temporal.PlainDate;

    if (view === 'day') {
      newDate = calendarControls.getDate().subtract({ days: 1 });
    } else if (view === 'week') {
      newDate = calendarControls.getDate().subtract({ weeks: 1 });
    } else {
      newDate = calendarControls.getDate().subtract({ months: 1 });
    }

    calendarControls.setDate(newDate);
    setCurrentDate(new Date(newDate.toString()));
  };

  const getHeaderTitle = () => {
    if (currentView === 'day') {
      return format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } else if (currentView === 'week') {
      return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    } else {
      return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-[650px] w-full" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Calendário</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie todos os eventos
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/eventos')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        </div>

        {/* Controles do Calendário */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-card border rounded-lg p-4">
          {/* Navegação */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Hoje
            </Button>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[200px] justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span className="capitalize">{getHeaderTitle()}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={handleDateSelect}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Seletor de View */}
          <div className="flex items-center gap-2">
            <Select value={currentView} onValueChange={handleViewChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Dia</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month-grid">Mês</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground">Reunião</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-muted-foreground">Apresentação</span>
            </div>
          </div>
        </div>

        {/* Calendário */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <ScheduleXCalendar
            calendarApp={calendarApp}
            customComponents={{
              headerContent: () => null,
            }}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
