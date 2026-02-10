'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Presentation, Role, PresentationStatus } from '@/types';
import { presentationsService } from '@/lib/services';
import { AuthGuard } from '@/components/auth-guard';
import { PageHeader, EmptyState } from '@/components/ui-components';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, GraduationCap, UserCircle, Calendar } from 'lucide-react';

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

export default function MeusTccsPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await presentationsService.findMyPresentations();
        setPresentations(data);
      } catch (error) {
        toast.error('Erro ao carregar TCCs');
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
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={[Role.ALUNO]}>
      <div className="space-y-6">
        <PageHeader
          title="Meus TCCs"
          description="Acompanhe seus trabalhos de conclusão de curso"
        />

        {presentations.length === 0 ? (
          <EmptyState
            title="Nenhum TCC encontrado"
            description="Você ainda não possui nenhum TCC cadastrado"
            icon={<FileText className="h-12 w-12" />}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {presentations.map((presentation) => (
              <Card key={presentation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-2">{presentation.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Semestre {presentation.semester}
                      </CardDescription>
                    </div>
                    <Badge variant={statusBadgeVariants[presentation.status]}>
                      {statusLabels[presentation.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {presentation.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {presentation.description}
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Orientador:</span>
                      <span className="font-medium">{presentation.advisor?.name}</span>
                    </div>
                    {presentation.coadvisor && (
                      <div className="flex items-center gap-2 text-sm">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Coorientador:</span>
                        <span className="font-medium">{presentation.coadvisor.name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
