'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Event, Role, EventType } from '@/types';
import { eventsService } from '@/lib/services';
import { AuthGuard } from '@/components/auth-guard';
import { PageHeader, EmptyState } from '@/components/ui-components';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, GraduationCap, CalendarCheck } from 'lucide-react';

const typeLabels: Record<EventType, string> = {
  [EventType.REUNIAO]: 'Reunião',
  [EventType.APRESENTACAO]: 'Apresentação',
};

export default function MeusEventosPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await eventsService.findMyEvents();
        setEvents(data);
      } catch (error) {
        toast.error('Erro ao carregar eventos');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={[Role.ALUNO]}>
      <div className="space-y-6">
        <PageHeader
          title="Meus Eventos"
          description="Reuniões e apresentações agendadas"
        />

        {events.length === 0 ? (
          <EmptyState
            title="Nenhum evento encontrado"
            description="Você não tem eventos agendados no momento"
            icon={<CalendarCheck className="h-12 w-12" />}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {event.title || event.presentation?.title || 'Evento'}
                    </CardTitle>
                    <Badge variant={event.type === 'apresentacao' ? 'default' : 'secondary'}>
                      {typeLabels[event.type]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(event.startDate), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(event.startDate), "HH:mm", { locale: ptBR })} -{' '}
                      {format(new Date(event.endDate), "HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  {event.local && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.local.name}</span>
                    </div>
                  )}
                  {event.presentation && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="line-clamp-1">{event.presentation.title}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
