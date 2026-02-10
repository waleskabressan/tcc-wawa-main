---
applyTo: '**'
---


# 📚 Sistema de Agendamento para Apresentações de TCC - UEMG

## 📋 Visão Geral do Projeto

### Problema Identificado
A funcionária da faculdade responsável pelos agendamentos de apresentações de TCC não possui competência suficiente para realizar essa tarefa manualmente de forma eficiente, gerando gargalos no processo acadêmico.

### Proposta de Solução
Desenvolver um sistema web automatizado que facilite e agilize as tarefas de:
- Cadastro de temas de TCC
- Agendamento de reuniões de orientação
- Agendamento de apresentações de TCC
- Gestão de usuários (alunos, professores, secretários)

### Tecnologias Utilizadas
- **Backend**: Python + FastAPI + Uvicorn
- **Frontend**: React.js
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Criptografia**: Senhas criptografadas

---

## 👥 Tipos de Usuários

### 🎓 Aluno
- **Acesso**: Login com email e senha
- **Funcionalidades**:
  - Visualizar temas de TCC disponíveis
  - Consultar agendamentos de reuniões
  - Visualizar cronograma de apresentações

### 👨‍🏫 Professor
- **Acesso**: Login com email e senha
- **Funcionalidades**:
  - Cadastrar novos temas de TCC
  - Agendar reuniões de orientação com alunos
  - Visualizar cronograma de apresentações
  - Gerenciar temas sob sua orientação

### 👩‍💼 Secretário
- **Acesso**: Login com email e senha
- **Funcionalidades**:
  - Criar eventos de apresentações de TCC
  - Gerenciar locais disponíveis
  - Visualizar e organizar cronograma geral
  - Administrar agendamentos

---

## 🔐 Sistema de Autenticação

### Fluxo de Login
1. Usuário insere email e senha
2. Sistema valida credenciais (senha criptografada)
3. Sistema gera JWT token
4. Token é enviado para o frontend React
5. Frontend armazena token para requisições subsequentes

### Segurança
- ✅ Senhas criptografadas no banco
- ✅ Transmissão apenas de JWT tokens
- ✅ Tokens com tempo de expiração
- ✅ Validação de permissões por tipo de usuário

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `User`
```sql
- id (Primary Key)
- name (VARCHAR)
- email (VARCHAR UNIQUE)
- password (VARCHAR - criptografado)
- role (ENUM: 'aluno', 'professor', 'secretario')
```

### Tabela: `Local`
```sql
- id (Primary Key)
- name (VARCHAR) - nome da sala/local
```

### Tabela: `Presentation` (Tema do TCC)
```sql
- id (Primary Key)
- title (VARCHAR) - título do TCC
- description (TEXT) - descrição detalhada
- student (INTEGER) - FK para User (aluno)
- advisor (INTEGER) - FK para User (professor orientador)
- semester (VARCHAR) - semestre (ex: "1/25", "2/25")
```

### Tabela: `Event`
```sql
- id (Primary Key)
- type (ENUM: 'reuniao', 'apresentacao')
- presentation (INTEGER) - FK para Presentation
- participants (TEXT) - lista de participantes
- startDate (DATETIME) - data e hora de início
- endDate (DATETIME) - data e hora de término  
- local (INTEGER) - FK para Local
```

### Tabela: `Participants` (Tabela de relacionamento)
```sql
- type (ENUM: 'banca', 'orientador', 'coorientador', 'aluno', 'outros') - tipo de participação
- user (INTEGER) - FK para User
```

---

## 🔄 Fluxos Principais

### 1. Cadastro de Tema de TCC (Professor)
```
Professor → Login → Dashboard → "Novo Tema" → 
Preenche formulário (título, descrição, aluno, semestre) → 
Sistema salva na tabela Presentation
```

### 2. Agendamento de Reunião (Professor Orientador)
```
Professor → Login → "Minhas Orientações" → Seleciona aluno → 
"Agendar Reunião" → Define data/hora/local → 
Sistema cria Event tipo "reuniao"
```

### 3. Agendamento de Apresentação (Secretário)
```
Secretário → Login → "Apresentações" → "Nova Apresentação" → 
Seleciona tema TCC → Define participantes → 
Escolhe data/hora/local → Sistema cria Event tipo "apresentacao"
```

---

## 📊 Funcionalidades por Módulo

### 🎓 Módulo Aluno
- [ ] Dashboard com resumo de atividades
- [ ] Consulta de temas disponíveis
- [ ] Visualização de reuniões agendadas
- [ ] Calendário de apresentações

### 👨‍🏫 Módulo Professor
- [ ] Cadastro de temas de TCC
- [ ] Gerenciamento de orientandos
- [ ] Agendamento de reuniões
- [ ] Dashboard com estatísticas

### 👩‍💼 Módulo Secretário
- [ ] Painel administrativo completo
- [ ] Criação de eventos de apresentação
- [ ] Gerenciamento de locais
- [ ] Relatórios e estatísticas
- [ ] Calendário geral

---

## 🚀 Roadmap de Desenvolvimento

### Fase 1: Infraestrutura Base
- [x] Setup do projeto FastAPI + Uvicorn
- [ ] Configuração do banco PostgreSQL
- [ ] Sistema de autenticação JWT
- [ ] Models e migrations do banco

### Fase 2: APIs Core
- [ ] CRUD de usuários
- [ ] CRUD de temas (Presentation)
- [ ] CRUD de eventos
- [ ] CRUD de locais
- [ ] Sistema de permissões

### Fase 3: Funcionalidades Específicas
- [ ] Agendamento de reuniões
- [ ] Agendamento de apresentações
- [ ] Notificações por email
- [ ] Validação de conflitos de horário

### Fase 4: Frontend React
- [ ] Telas de login
- [ ] Dashboard por tipo de usuário
- [ ] Formulários de cadastro
- [ ] Calendário interativo
- [ ] Interface responsiva

### Fase 5: Testes e Deploy
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Deploy em produção
- [ ] Documentação para usuários

---

## 📋 Casos de Uso Detalhados

### UC001: Professor Cadastra Tema de TCC
**Ator**: Professor  
**Pré-condições**: Professor autenticado  
**Fluxo**:
1. Professor acessa "Cadastrar Tema"
2. Preenche: título, descrição, seleciona aluno, define semestre
3. Sistema valida dados
4. Sistema salva tema na base
5. Sistema confirma cadastro

### UC002: Secretário Agenda Apresentação
**Ator**: Secretário  
**Pré-condições**: Secretário autenticado, tema TCC existente  
**Fluxo**:
1. Secretário acessa "Agendar Apresentação"
2. Seleciona tema do TCC
3. Define participantes da banca
4. Escolhe data, hora e local
5. Sistema valida disponibilidade
6. Sistema cria evento
7. Sistema envia notificações

### UC003: Professor Agenda Reunião
**Ator**: Professor Orientador  
**Pré-condições**: Professor autenticado, aluno orientando cadastrado  
**Fluxo**:
1. Professor acessa "Agendar Reunião"
2. Seleciona aluno orientando
3. Define data, hora e local
4. Sistema valida disponibilidade
5. Sistema cria reunião
6. Sistema notifica aluno

---

## 🔧 Configurações Técnicas

### Variáveis de Ambiente
```env
# Aplicação
DEBUG=True
HOST=0.0.0.0
PORT=8000
APP_NAME=TCC WAWA Backend

# Banco de Dados
POSTGRES_USER=user_tcc_schedule
POSTGRES_PASSWORD=password_tcc_schedule
POSTGRES_DB=tcc_schedule_db

# JWT
JWT_SECRET_KEY=sua_chave_secreta_aqui
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

### Dependências Python
```
fastapi
uvicorn
sqlalchemy
psycopg2-binary
alembic
python-jose[cryptography]
passlib[bcrypt]
python-multipart
python-dotenv
```

---

## 📈 Métricas de Sucesso

### Indicadores de Performance
- **Redução de tempo**: Diminuir em 70% o tempo gasto em agendamentos
- **Redução de erros**: Eliminar conflitos de horário e local
- **Satisfação do usuário**: Meta de 90% de satisfação
- **Adoção**: 100% dos agendamentos realizados pelo sistema

### Benefícios Esperados
- ✅ Automatização do processo de agendamento
- ✅ Redução de erros humanos
- ✅ Visibilidade completa do cronograma
- ✅ Notificações automáticas
- ✅ Relatórios gerenciais
- ✅ Backup automático de dados

---

## 📞 Próximos Passos

1. **Validação**: Apresentar proposta para a funcionária responsável
2. **Refinamento**: Coletar feedback e ajustar requisitos
3. **Prototipação**: Criar protótipo navegável
4. **Desenvolvimento**: Implementar versão MVP
5. **Testes**: Realizar testes com usuários reais
6. **Deploy**: Colocar em produção
7. **Treinamento**: Capacitar usuários finais

---

*Documento elaborado para o TCC do curso de [Seu Curso] - UEMG*  
*Data: Novembro 2025*  
*Autor: [Seu Nome]*