'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Event,
  User,
  Local,
  Presentation,
  Role,
  EventType,
  ParticipantType,
  CreateEventDto,
  UpdateEventDto,
} from '@/types';
import { eventsService, usersService, localsService, presentationsService } from '@/lib/services';
import { AuthGuard } from '@/components/auth-guard';
import { PageHeader, EmptyState } from '@/components/ui-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Loader2,
  Clock,
  MapPin,
  GraduationCap,
  Users,
  X,
  UserPlus,
} from 'lucide-react';
import { DateTimePicker } from '@/components/ui/date-time-picker';

const eventSchema = z.object({
  type: z.enum(['reuniao', 'apresentacao']),
  title: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().min(1, 'A data de início é obrigatória'),
  endDate: z.string().min(1, 'A data de término é obrigatória'),
  presentationId: z.coerce.number().optional(),
  localId: z.coerce.number().optional(),
});

interface EventFormData {
  type: 'reuniao' | 'apresentacao';
  title?: string;
  description?: string;
  startDate: string;
  endDate: string;
  presentationId?: number;
  localId?: number;
}

interface ParticipantFormData {
  userId: number;
  type: ParticipantType;
}

const typeLabels: Record<EventType, string> = {
  [EventType.REUNIAO]: 'Reunião',
  [EventType.APRESENTACAO]: 'Apresentação',
};

const participantTypeLabels: Record<ParticipantType, string> = {
  [ParticipantType.BANCA]: 'Banca',
  [ParticipantType.ORIENTADOR]: 'Orientador',
  [ParticipantType.COORIENTADOR]: 'Coorientador',
  [ParticipantType.ALUNO]: 'Aluno',
  [ParticipantType.OUTROS]: 'Outros',
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [locals, setLocals] = useState<Local[]>([]);
  const [participants, setParticipants] = useState<ParticipantFormData[]>([]);
  const [newParticipantUserId, setNewParticipantUserId] = useState<string>('');
  const [newParticipantType, setNewParticipantType] = useState<ParticipantType>(ParticipantType.OUTROS);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      type: 'reuniao',
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      presentationId: undefined,
      localId: undefined,
    },
  });

  const loadData = async () => {
    try {
      const [eventsData, usersData, localsData, presentationsData] = await Promise.all([
        eventsService.findAll(),
        usersService.findAll(),
        localsService.findActive(),
        presentationsService.findAll(),
      ]);
      setEvents(eventsData);
      setUsers(usersData);
      setLocals(localsData);
      setPresentations(presentationsData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDateForInput = (date: Date) => {
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  const openCreateDialog = () => {
    setSelectedEvent(null);
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    form.reset({
      type: 'reuniao',
      title: '',
      description: '',
      startDate: formatDateForInput(now),
      endDate: formatDateForInput(oneHourLater),
      presentationId: undefined,
      localId: undefined,
    });
    setParticipants([]);
    setNewParticipantUserId('');
    setNewParticipantType(ParticipantType.OUTROS);
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    form.reset({
      type: event.type,
      title: event.title || '',
      description: event.description || '',
      startDate: formatDateForInput(new Date(event.startDate)),
      endDate: formatDateForInput(new Date(event.endDate)),
      presentationId: event.presentationId || undefined,
      localId: event.localId || undefined,
    });
    // Carregar participantes existentes do evento
    const existingParticipants: ParticipantFormData[] = event.participants?.map((p) => ({
      userId: p.userId,
      type: p.type as ParticipantType,
    })) || [];
    setParticipants(existingParticipants);
    setNewParticipantUserId('');
    setNewParticipantType(ParticipantType.OUTROS);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const addParticipant = () => {
    if (!newParticipantUserId) {
      toast.error('Selecione um usuário');
      return;
    }
    const userId = parseInt(newParticipantUserId, 10);
    // Verificar se já existe
    if (participants.some((p) => p.userId === userId)) {
      toast.error('Este usuário já é um participante');
      return;
    }
    setParticipants([...participants, { userId, type: newParticipantType }]);
    setNewParticipantUserId('');
  };

  const removeParticipant = (userId: number) => {
    setParticipants(participants.filter((p) => p.userId !== userId));
  };

  const getUserById = (userId: number) => {
    return users.find((u) => u.id === userId);
  };

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const participantsData = participants.map((p) => ({
        userId: p.userId,
        type: p.type,
      }));

      if (selectedEvent) {
        const updateData: UpdateEventDto = {
          type: data.type as EventType,
          title: data.title,
          description: data.description,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          presentationId: data.presentationId || undefined,
          localId: data.localId || undefined,
          participants: participantsData,
        };
        await eventsService.update(selectedEvent.id, updateData);
        toast.success('Evento atualizado com sucesso!');
      } else {
        const createData: CreateEventDto = {
          type: data.type as EventType,
          title: data.title,
          description: data.description,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          presentationId: data.presentationId || undefined,
          localId: data.localId || undefined,
          participants: participantsData,
        };
        await eventsService.create(createData);
        toast.success('Evento criado com sucesso!');
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar evento';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      await eventsService.remove(selectedEvent.id);
      toast.success('Evento excluído com sucesso!');
      setIsDeleteDialogOpen(false);
      loadData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao excluir evento';
      toast.error(Array.isArray(message) ? message[0] : message);
    }
  };

  const filteredEvents = events.filter((event) => {
    if (activeTab === 'all') return true;
    return event.type === activeTab;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={[Role.SECRETARIO, Role.PROFESSOR]}>
      <div className="space-y-6">
        <PageHeader title="Eventos" description="Gerenciar reuniões e apresentações">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        </PageHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="reuniao">Reuniões</TabsTrigger>
            <TabsTrigger value="apresentacao">Apresentações</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredEvents.length === 0 ? (
              <EmptyState
                title="Nenhum evento encontrado"
                description="Agende uma reunião ou apresentação"
                icon={<Calendar className="h-12 w-12" />}
                action={
                  <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Evento
                  </Button>
                }
              />
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Participantes</TableHead>
                      <TableHead>TCC</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <Badge variant={event.type === 'apresentacao' ? 'default' : 'secondary'}>
                            {typeLabels[event.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium max-w-[150px] truncate">
                          {event.title || event.presentation?.title || 'Sem título'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {format(new Date(event.startDate), "dd/MM/yy HH:mm", {
                                locale: ptBR,
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              até{' '}
                              {format(new Date(event.endDate), "HH:mm", {
                                locale: ptBR,
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {event.local ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {event.local.name}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {event.participants && event.participants.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{event.participants.length}</span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {event.presentation ? (
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3 text-muted-foreground" />
                              {event.presentation.title}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(event)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(event)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedEvent ? 'Editar Evento' : 'Novo Evento'}
              </DialogTitle>
              <DialogDescription>
                {selectedEvent
                  ? 'Atualize os dados do evento'
                  : 'Preencha os dados para criar um novo evento'}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="reuniao">Reunião</SelectItem>
                          <SelectItem value="apresentacao">Apresentação</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Título do evento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descrição do evento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Início</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Término</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="localId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local (opcional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} 
                        defaultValue={field.value?.toString() || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o local" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {locals.map((local) => (
                            <SelectItem key={local.id} value={local.id.toString()}>
                              {local.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="presentationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TCC Relacionado (opcional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} 
                        defaultValue={field.value?.toString() || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o TCC" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {presentations.map((presentation) => (
                            <SelectItem key={presentation.id} value={presentation.id.toString()}>
                              {presentation.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Seção de Participantes */}
                <div className="space-y-3">
                  <FormLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Participantes
                  </FormLabel>

                  {/* Lista de participantes adicionados */}
                  {participants.length > 0 && (
                    <div className="border rounded-lg p-3 space-y-2">
                      {participants.map((participant) => {
                        const user = getUserById(participant.userId);
                        return (
                          <div
                            key={participant.userId}
                            className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {user?.name || `Usuário ${participant.userId}`}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {participantTypeLabels[participant.type]}
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => removeParticipant(participant.userId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Formulário para adicionar participante */}
                  <div className="flex gap-2">
                    <Select
                      value={newParticipantUserId}
                      onValueChange={setNewParticipantUserId}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione o usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {users
                          .filter((u) => !participants.some((p) => p.userId === u.id))
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={newParticipantType}
                      onValueChange={(value) => setNewParticipantType(value as ParticipantType)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ParticipantType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {participantTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addParticipant}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : selectedEvent ? (
                      'Salvar'
                    ) : (
                      'Criar'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este evento? Esta ação não pode ser
                desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
}
