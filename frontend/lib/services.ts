import api from './api';
import Cookies from 'js-cookie';
import {
  LoginDto,
  RegisterDto,
  AuthResponse,
  User,
  Local,
  CreateLocalDto,
  UpdateLocalDto,
  Presentation,
  CreatePresentationDto,
  UpdatePresentationDto,
  Event,
  CreateEventDto,
  UpdateEventDto,
  CreateUserDto,
  UpdateUserDto,
} from '@/types';

// Auth Services
export const authService = {
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    Cookies.set('token', response.data.accessToken, { expires: 1 });
    return response.data;
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    Cookies.set('token', response.data.accessToken, { expires: 1 });
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout() {
    Cookies.remove('token');
  },
};

// Users Services
export const usersService = {
  async findAll(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  async findOne(id: number): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async create(data: CreateUserDto): Promise<User> {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  async update(id: number, data: UpdateUserDto): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

// Locals Services
export const localsService = {
  async findAll(): Promise<Local[]> {
    const response = await api.get<Local[]>('/locals');
    return response.data;
  },

  async findActive(): Promise<Local[]> {
    const response = await api.get<Local[]>('/locals/active');
    return response.data;
  },

  async findOne(id: number): Promise<Local> {
    const response = await api.get<Local>(`/locals/${id}`);
    return response.data;
  },

  async create(data: CreateLocalDto): Promise<Local> {
    const response = await api.post<Local>('/locals', data);
    return response.data;
  },

  async update(id: number, data: UpdateLocalDto): Promise<Local> {
    const response = await api.patch<Local>(`/locals/${id}`, data);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/locals/${id}`);
  },
};

// Presentations Services
export const presentationsService = {
  async findAll(): Promise<Presentation[]> {
    const response = await api.get<Presentation[]>('/presentations');
    return response.data;
  },

  async findMyOrientations(): Promise<Presentation[]> {
    const response = await api.get<Presentation[]>('/presentations/my-orientations');
    return response.data;
  },

  async findMyPresentations(): Promise<Presentation[]> {
    const response = await api.get<Presentation[]>('/presentations/my-presentations');
    return response.data;
  },

  async findOne(id: number): Promise<Presentation> {
    const response = await api.get<Presentation>(`/presentations/${id}`);
    return response.data;
  },

  async create(data: CreatePresentationDto): Promise<Presentation> {
    const response = await api.post<Presentation>('/presentations', data);
    return response.data;
  },

  async update(id: number, data: UpdatePresentationDto): Promise<Presentation> {
    const response = await api.patch<Presentation>(`/presentations/${id}`, data);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/presentations/${id}`);
  },
};

// Events Services
export const eventsService = {
  async findAll(): Promise<Event[]> {
    const response = await api.get<Event[]>('/events');
    return response.data;
  },

  async findReunioes(): Promise<Event[]> {
    const response = await api.get<Event[]>('/events/reunioes');
    return response.data;
  },

  async findApresentacoes(): Promise<Event[]> {
    const response = await api.get<Event[]>('/events/apresentacoes');
    return response.data;
  },

  async findUpcoming(limit?: number): Promise<Event[]> {
    const response = await api.get<Event[]>('/events/upcoming', {
      params: { limit },
    });
    return response.data;
  },

  async findMyEvents(): Promise<Event[]> {
    const response = await api.get<Event[]>('/events/my-events');
    return response.data;
  },

  async findOne(id: number): Promise<Event> {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  async create(data: CreateEventDto): Promise<Event> {
    const response = await api.post<Event>('/events', data);
    return response.data;
  },

  async update(id: number, data: UpdateEventDto): Promise<Event> {
    const response = await api.patch<Event>(`/events/${id}`, data);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/events/${id}`);
  },
};
