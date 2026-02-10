'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { toast } from 'sonner';
import {
  Presentation,
  User,
  Role,
  PresentationStatus,
  CreatePresentationDto,
  UpdatePresentationDto,
} from '@/types';
import { presentationsService, usersService } from '@/lib/services';
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
import { Plus, Pencil, Trash2, FileText, Loader2, GraduationCap, UserCircle } from 'lucide-react';

const presentationSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  semester: z.string().min(1, 'O semestre é obrigatório'),
  studentId: z.coerce.number().min(1, 'Selecione o aluno'),
  advisorId: z.coerce.number().min(1, 'Selecione o orientador'),
  coadvisorId: z.coerce.number().optional(),
  status: z.enum(['pending', 'approved', 'in_progress', 'completed', 'cancelled']),
});

type PresentationFormData = z.infer<typeof presentationSchema>;

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

export default function PresentationsPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);

  const form = useForm<PresentationFormData>({
    resolver: zodResolver(presentationSchema),
    defaultValues: {
      title: '',
      description: '',
      semester: '',
      studentId: 0,
      advisorId: 0,
      coadvisorId: undefined,
      status: 'pending',
    },
  });

  const loadData = async () => {
    try {
      const [presentationsData, usersData] = await Promise.all([
        presentationsService.findAll(),
        usersService.findAll(),
      ]);
      setPresentations(presentationsData);
      setUsers(usersData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const students = users.filter((u) => u.role === Role.ALUNO);
  const professors = users.filter((u) => u.role === Role.PROFESSOR);

  const openCreateDialog = () => {
    setSelectedPresentation(null);
    form.reset({
      title: '',
      description: '',
      semester: '',
      studentId: 0,
      advisorId: 0,
      coadvisorId: undefined,
      status: 'pending',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
    form.reset({
      title: presentation.title,
      description: presentation.description || '',
      semester: presentation.semester,
      studentId: presentation.studentId,
      advisorId: presentation.advisorId,
      coadvisorId: presentation.coadvisorId || undefined,
      status: presentation.status,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: PresentationFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedPresentation) {
        const updateData: UpdatePresentationDto = {
          title: data.title,
          description: data.description,
          semester: data.semester,
          studentId: data.studentId,
          advisorId: data.advisorId,
          coadvisorId: data.coadvisorId || undefined,
          status: data.status as PresentationStatus,
        };
        await presentationsService.update(selectedPresentation.id, updateData);
        toast.success('Apresentação atualizada com sucesso!');
      } else {
        const createData: CreatePresentationDto = {
          title: data.title,
          description: data.description,
          semester: data.semester,
          studentId: data.studentId,
          advisorId: data.advisorId,
          coadvisorId: data.coadvisorId || undefined,
          status: data.status as PresentationStatus,
        };
        await presentationsService.create(createData);
        toast.success('Apresentação criada com sucesso!');
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar apresentação';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPresentation) return;
    try {
      await presentationsService.remove(selectedPresentation.id);
      toast.success('Apresentação excluída com sucesso!');
      setIsDeleteDialogOpen(false);
      loadData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao excluir apresentação';
      toast.error(Array.isArray(message) ? message[0] : message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={[Role.SECRETARIO, Role.PROFESSOR]}>
      <div className="space-y-6">
        <PageHeader title="Apresentações" description="Gerenciar TCCs e apresentações">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Apresentação
          </Button>
        </PageHeader>

        {presentations.length === 0 ? (
          <EmptyState
            title="Nenhuma apresentação encontrada"
            description="Cadastre o primeiro TCC do sistema"
            icon={<FileText className="h-12 w-12" />}
            action={
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Apresentação
              </Button>
            }
          />
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Orientador</TableHead>
                  <TableHead>Semestre</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presentations.map((presentation) => (
                  <TableRow key={presentation.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {presentation.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        {presentation.student?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                        {presentation.advisor?.name}
                      </div>
                    </TableCell>
                    <TableCell>{presentation.semester}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariants[presentation.status]}>
                        {statusLabels[presentation.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(presentation)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(presentation)}
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedPresentation ? 'Editar Apresentação' : 'Nova Apresentação'}
              </DialogTitle>
              <DialogDescription>
                {selectedPresentation
                  ? 'Atualize os dados do TCC'
                  : 'Preencha os dados para cadastrar um novo TCC'}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do TCC</FormLabel>
                      <FormControl>
                        <Input placeholder="Título do trabalho" {...field} />
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
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição do trabalho (opcional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semestre</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 1/25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="approved">Aprovado</SelectItem>
                            <SelectItem value="in_progress">Em Andamento</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aluno</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o aluno" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              {student.name}
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
                  name="advisorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orientador</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o orientador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {professors.map((professor) => (
                            <SelectItem key={professor.id} value={professor.id.toString()}>
                              {professor.name}
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
                  name="coadvisorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coorientador (opcional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} 
                        defaultValue={field.value?.toString() || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o coorientador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {professors.map((professor) => (
                            <SelectItem key={professor.id} value={professor.id.toString()}>
                              {professor.name}
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
                        Salvando...
                      </>
                    ) : selectedPresentation ? (
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
                Tem certeza que deseja excluir a apresentação{' '}
                <strong>{selectedPresentation?.title}</strong>? Esta ação não pode
                ser desfeita.
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
