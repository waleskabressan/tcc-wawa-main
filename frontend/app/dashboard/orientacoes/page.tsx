'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Presentation, Role, PresentationStatus, Event, Local, CreateEventDto, EventType } from '@/types';
import { presentationsService, eventsService, localsService } from '@/lib/services';
import { AuthGuard } from '@/components/auth-guard';
import { PageHeader, EmptyState } from '@/components/ui-components';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { GraduationCap, Calendar, UserCircle, Plus, Loader2 } from 'lucide-react';
import { DateTimePicker } from '@/components/ui/date-time-picker';

const statusLabels: Record<PresentationStatus, string> = {
  [PresentationStatus.PENDING]: 'Pendente',
  [PresentationStatus.APPROVED]: 'Aprovado',
  [PresentationStatus.IN_PROGRESS]: 'Em Andamento',
  [PresentationStatus.COMPLETED]: 'Concluído',
  [PresentationStatus.CANCELLED]: 'Cancelado',
};

const statusBadgeVariants: Record<PresentationStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  [PresentationStatus.PENDING]: 'secondary',
  [PresentationStatus.APPROVED]: 'default',
  [PresentationStatus.IN_PROGRESS]: 'outline',
  [PresentationStatus.COMPLETED]: 'default',
  [PresentationStatus.CANCELLED]: 'destructive',
};

const reuniaoSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'A data de início é obrigatória'),
  endDate: z.string().min(1, 'A data de término é obrigatória'),
  localId: z.number().optional(),
  presentationId: z.number(),
});

type ReuniaoFormData = z.infer<typeof reuniaoSchema>;

export default function OrientacoesPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [locals, setLocals] = useState<Local[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);

  const form = useForm<ReuniaoFormData>({
    resolver: zodResolver(reuniaoSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      localId: undefined,
      presentationId: 0,
    },
  });

  const loadData = async () => {
    try {
      const [presentationsData, localsData] = await Promise.all([
        presentationsService.findMyOrientations(),
        localsService.findActive(),
      ]);
      setPresentations(presentationsData);
      setLocals(localsData);
    } catch (error) {
      toast.error('Erro ao carregar orientações');
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

  const openAgendarReuniao = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    form.reset({
      title: `Reunião de orientação - ${presentation.student?.name}`,
      description: '',
      startDate: formatDateForInput(now),
      endDate: formatDateForInput(oneHourLater),
      localId: undefined,
      presentationId: presentation.id,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ReuniaoFormData) => {
    setIsSubmitting(true);
    try {
      const createData: CreateEventDto = {
        type: EventType.REUNIAO,
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        presentationId: data.presentationId,
        localId: data.localId || undefined,
      };
      await eventsService.create(createData);
      toast.success('Reunião agendada com sucesso!');
      setIsDialogOpen(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao agendar reunião';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={[Role.PROFESSOR]}>
      <div className="space-y-6">
        <PageHeader
          title="Minhas Orientações"
          description="Gerencie seus orientandos e agende reuniões"
        />

        {presentations.length === 0 ? (
          <EmptyState
            title="Nenhuma orientação encontrada"
            description="Você não possui orientandos no momento"
            icon={<GraduationCap className="h-12 w-12" />}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {presentations.map((presentation) => (
              <Card key={presentation.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{presentation.title}</CardTitle>
                    <Badge variant={statusBadgeVariants[presentation.status]}>
                      {statusLabels[presentation.status]}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Semestre {presentation.semester}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Aluno:</span>
                    <span className="font-medium">{presentation.student?.name}</span>
                  </div>
                  {presentation.coadvisor && (
                    <div className="flex items-center gap-2 text-sm">
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Coorientador:</span>
                      <span className="font-medium">{presentation.coadvisor.name}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openAgendarReuniao(presentation)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agendar Reunião
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Reunião</DialogTitle>
              <DialogDescription>
                Agende uma reunião de orientação com {selectedPresentation?.student?.name}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título da reunião" {...field} />
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
                        <Textarea placeholder="Pauta da reunião" {...field} />
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
                        Agendando...
                      </>
                    ) : (
                      'Agendar'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
