'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { toast } from 'sonner';
import { Local, Role, CreateLocalDto, UpdateLocalDto } from '@/types';
import { localsService } from '@/lib/services';
import { AuthGuard } from '@/components/auth-guard';
import { PageHeader, EmptyState } from '@/components/ui-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, MapPin, Loader2, Users } from 'lucide-react';

const localSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  capacity: z.coerce.number().min(1, 'A capacidade deve ser pelo menos 1'),
  isActive: z.boolean(),
});

type LocalFormData = z.infer<typeof localSchema>;

export default function LocalsPage() {
  const [locals, setLocals] = useState<Local[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLocal, setSelectedLocal] = useState<Local | null>(null);

  const form = useForm<LocalFormData>({
    resolver: zodResolver(localSchema),
    defaultValues: {
      name: '',
      description: '',
      capacity: 30,
      isActive: true,
    },
  });

  const loadLocals = async () => {
    try {
      const data = await localsService.findAll();
      setLocals(data);
    } catch (error) {
      toast.error('Erro ao carregar locais');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocals();
  }, []);

  const openCreateDialog = () => {
    setSelectedLocal(null);
    form.reset({
      name: '',
      description: '',
      capacity: 30,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (local: Local) => {
    setSelectedLocal(local);
    form.reset({
      name: local.name,
      description: local.description || '',
      capacity: local.capacity,
      isActive: local.isActive,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (local: Local) => {
    setSelectedLocal(local);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: LocalFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedLocal) {
        const updateData: UpdateLocalDto = {
          name: data.name,
          description: data.description,
          capacity: data.capacity,
          isActive: data.isActive,
        };
        await localsService.update(selectedLocal.id, updateData);
        toast.success('Local atualizado com sucesso!');
      } else {
        const createData: CreateLocalDto = {
          name: data.name,
          description: data.description,
          capacity: data.capacity,
          isActive: data.isActive,
        };
        await localsService.create(createData);
        toast.success('Local criado com sucesso!');
      }
      setIsDialogOpen(false);
      loadLocals();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar local';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLocal) return;
    try {
      await localsService.remove(selectedLocal.id);
      toast.success('Local excluído com sucesso!');
      setIsDeleteDialogOpen(false);
      loadLocals();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao excluir local';
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
    <AuthGuard allowedRoles={[Role.SECRETARIO]}>
      <div className="space-y-6">
        <PageHeader title="Locais" description="Gerenciar salas e locais de apresentação">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Local
          </Button>
        </PageHeader>

        {locals.length === 0 ? (
          <EmptyState
            title="Nenhum local encontrado"
            description="Cadastre a primeira sala do sistema"
            icon={<MapPin className="h-12 w-12" />}
            action={
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Local
              </Button>
            }
          />
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locals.map((local) => (
                  <TableRow key={local.id}>
                    <TableCell className="font-medium">{local.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {local.description || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {local.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={local.isActive ? 'default' : 'secondary'}>
                        {local.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(local)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(local)}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedLocal ? 'Editar Local' : 'Novo Local'}
              </DialogTitle>
              <DialogDescription>
                {selectedLocal
                  ? 'Atualize os dados do local'
                  : 'Preencha os dados para criar um novo local'}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sala 101" {...field} />
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
                          placeholder="Descrição do local (opcional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="30"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Número máximo de pessoas no local
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Ativo</FormLabel>
                        <FormDescription>
                          Locais inativos não aparecem para agendamento
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
                    ) : selectedLocal ? (
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
                Tem certeza que deseja excluir o local{' '}
                <strong>{selectedLocal?.name}</strong>? Esta ação não pode ser
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
