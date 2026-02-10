// Enums
export enum Role {
  ALUNO = 'aluno',
  PROFESSOR = 'professor',
  SECRETARIO = 'secretario',
}

export enum EventType {
  REUNIAO = 'reuniao',
  APRESENTACAO = 'apresentacao',
}

export enum PresentationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ParticipantType {
  BANCA = 'banca',
  ORIENTADOR = 'orientador',
  COORIENTADOR = 'coorientador',
  ALUNO = 'aluno',
  OUTROS = 'outros',
}

// Entities
export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Local {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Presentation {
  id: number;
  title: string;
  description: string | null;
  semester: string;
  status: PresentationStatus;
  student: User;
  studentId: number;
  advisor: User;
  advisorId: number;
  coadvisor: User | null;
  coadvisorId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventParticipant {
  id: number;
  type: ParticipantType;
  user: User;
  userId: number;
  eventId: number;
}

export interface Event {
  id: number;
  type: EventType;
  title: string | null;
  description: string | null;
  startDate: string;
  endDate: string;
  presentation: Presentation | null;
  presentationId: number | null;
  local: Local | null;
  localId: number | null;
  participants: EventParticipant[];
  createdAt: string;
  updatedAt: string;
}

// DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

export interface CreateLocalDto {
  name: string;
  description?: string;
  capacity?: number;
  isActive?: boolean;
}

export interface UpdateLocalDto {
  name?: string;
  description?: string;
  capacity?: number;
  isActive?: boolean;
}

export interface CreatePresentationDto {
  title: string;
  description?: string;
  semester: string;
  studentId: number;
  advisorId: number;
  coadvisorId?: number;
  status?: PresentationStatus;
}

export interface UpdatePresentationDto {
  title?: string;
  description?: string;
  semester?: string;
  studentId?: number;
  advisorId?: number;
  coadvisorId?: number;
  status?: PresentationStatus;
}

export interface ParticipantDto {
  userId: number;
  type: ParticipantType;
}

export interface CreateEventDto {
  type: EventType;
  title?: string;
  description?: string;
  startDate: string;
  endDate: string;
  presentationId?: number;
  localId?: number;
  participants?: ParticipantDto[];
}

export interface UpdateEventDto {
  type?: EventType;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  presentationId?: number;
  localId?: number;
  participants?: ParticipantDto[];
}

// Auth Response
export interface AuthResponse {
  accessToken: string;
  user: User;
}

// API Error
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
