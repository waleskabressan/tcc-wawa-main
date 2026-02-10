'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Role, Event, Presentation, User, Local } from '@/types';
import { eventsService, presentationsService, usersService, localsService } from '@/lib/services';
import { PageHeader, StatCard, EmptyState } from '@/components/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Users,
  MapPin,
  FileText,
  Clock,
  CalendarCheck,
  GraduationCap,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    locals: 0,
    presentations: 0,
    events: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsData] = await Promise.all([
          eventsService.findUpcoming(5),
        ]);
        setUpcomingEvents(eventsData);

        if (user?.role === Role.SECRETARIO) {
          const [usersData, localsData, presentationsData, allEvents] = await Promise.all([
            usersService.findAll(),
            localsService.findAll(),
            presentationsService.findAll(),
            eventsService.findAll(),
          ]);
          setStats({
            users: usersData.length,
            locals: localsData.length,
            presentations: presentationsData.length,
            events: allEvents.length,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const roleLabels: Record<Role, string> = {
    [Role.SECRETARIO]: 'Secretário',
    [Role.PROFESSOR]: 'Professor',
    [Role.ALUNO]: 'Aluno',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bem-vindo, ${user?.name}!`}
        description={`Você está logado como ${roleLabels[user?.role || Role.ALUNO]}`}
      />

      {user?.role === Role.SECRETARIO && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Usuários"
            value={stats.users}
            description="Total cadastrado"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Locais"
            value={stats.locals}
            description="Salas disponíveis"
            icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Apresentações"
            value={stats.presentations}
            description="TCCs cadastrados"
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Eventos"
            value={stats.events}
            description="Agendamentos"
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Próximos Eventos
          </CardTitle>
          <CardDescription>Eventos agendados para os próximos dias</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <EmptyState
              title="Nenhum evento agendado"
              description="Não há eventos próximos no momento"
              icon={<Calendar className="h-12 w-12" />}
            />
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {event.type === 'apresentacao' ? (
                        <GraduationCap className="h-5 w-5 text-primary" />
                      ) : (
                        <Calendar className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {event.title || event.presentation?.title || 'Evento'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.startDate), "dd 'de' MMMM 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={event.type === 'apresentacao' ? 'default' : 'secondary'}>
                      {event.type === 'apresentacao' ? 'Apresentação' : 'Reunião'}
                    </Badge>
                    {event.local && (
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.local.name}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
