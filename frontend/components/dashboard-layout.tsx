'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Role } from '@/types';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  MapPin,
  FileText,
  Calendar,
  CalendarCheck,
  LogOut,
  GraduationCap,
  Moon,
  Sun,
  CalendarDays,
} from 'lucide-react';
import { useTheme } from 'next-themes';

const menuItems = {
  [Role.SECRETARIO]: [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Calendário', href: '/dashboard/calendario', icon: CalendarDays },
    { title: 'Usuários', href: '/dashboard/usuarios', icon: Users },
    { title: 'Locais', href: '/dashboard/locais', icon: MapPin },
    { title: 'Apresentações', href: '/dashboard/apresentacoes', icon: FileText },
    { title: 'Eventos', href: '/dashboard/eventos', icon: Calendar },
  ],
  [Role.PROFESSOR]: [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Calendário', href: '/dashboard/calendario', icon: CalendarDays },
    { title: 'Minhas Orientações', href: '/dashboard/orientacoes', icon: GraduationCap },
    { title: 'Eventos', href: '/dashboard/eventos', icon: Calendar },
  ],
  [Role.ALUNO]: [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Calendário', href: '/dashboard/calendario', icon: CalendarDays },
    { title: 'Meus TCCs', href: '/dashboard/meus-tccs', icon: FileText },
    { title: 'Meus Eventos', href: '/dashboard/meus-eventos', icon: CalendarCheck },
  ],
};

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  const items = menuItems[user.role] || [];
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleLabels: Record<Role, string> = {
    [Role.SECRETARIO]: 'Secretário',
    [Role.PROFESSOR]: 'Professor',
    [Role.ALUNO]: 'Aluno',
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-lg font-bold">TCC UEMG</h2>
            <p className="text-xs text-muted-foreground">Sistema de Agendamento</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{roleLabels[user.role]}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              {theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <SidebarTrigger />
          </header>
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
