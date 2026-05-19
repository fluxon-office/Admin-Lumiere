const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');

const statusFromApi = {
  PENDENTE: 'pendente',
  CONFIRMADO: 'confirmado',
  REMARCAR: 'remarcar',
  CANCELADO: 'cancelado',
  CONCLUIDO: 'confirmado',
};

const statusActionPath = {
  confirmado: 'confirmar',
  remarcar: 'remarcar',
  cancelado: 'cancelar',
};

function buildApiUrl(path) {
  return path.startsWith('/') ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
}

function encodeBasicAuth({ email, senha }) {
  const value = `${email}:${senha}`;
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return `Basic ${window.btoa(binary)}`;
}

async function readJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}

async function apiRequest(path, { auth, body, method = 'GET' } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    headers.Authorization = encodeBasicAuth(auth);
  }

  const response = await fetch(buildApiUrl(path), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(payload?.mensagem || 'Nao foi possivel concluir a acao no backend.');
  }

  return payload;
}

function splitDateTime(value) {
  if (!value) {
    return { date: '', time: '' };
  }

  const [date, time = ''] = value.split('T');
  return {
    date,
    time: time.slice(0, 5),
  };
}

function formatPrice(value) {
  const numericValue = Number(value || 0);

  return numericValue.toLocaleString('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  });
}

function parsePrice(value) {
  if (typeof value === 'number') {
    return value;
  }

  const normalized = String(value || '')
    .replace(/\s/g, '')
    .replace('R$', '')
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDuration(value) {
  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number(String(value || '').match(/\d+/)?.[0]);
  return Number.isFinite(parsed) ? parsed : 60;
}

function normalizeAppointment(appointment) {
  const { date, time } = splitDateTime(appointment.dataHora);
  const clientName = appointment.cliente?.nome || 'Cliente sem nome';
  const status = statusFromApi[appointment.status] || 'pendente';

  return {
    id: appointment.id,
    client: clientName,
    phone: appointment.cliente?.telefone || '',
    email: appointment.cliente?.email || '',
    service: appointment.servico?.nome || 'Servico nao informado',
    serviceId: appointment.servico?.id,
    date,
    time,
    status,
    source: 'Sistema',
    notes: appointment.observacao || 'Sem observacoes registradas.',
    history: [
      `Solicitado em ${splitDateTime(appointment.criadoEm).date || date}`,
      `Status atual: ${status}`,
    ],
  };
}

function normalizeClient(client) {
  const { date: nextDate, time: nextTime } = splitDateTime(client.proximaVisita);

  return {
    id: client.id,
    name: client.nome || 'Cliente sem nome',
    phone: client.telefone || '',
    email: client.email || '',
    lastService: client.ultimoServico || 'Sem historico',
    nextVisit: nextDate ? `${nextDate}${nextTime ? ` ${nextTime}` : ''}` : 'Sem retorno marcado',
    totalAppointments: Number(client.totalAgendamentos || 0),
  };
}

function normalizeService(service) {
  return {
    id: service.id,
    name: service.nome || '',
    category: service.categoria || 'Facial',
    duration: `${service.duracaoMinutos || 60} min`,
    price: formatPrice(service.preco),
    active: service.ativo !== false,
    published: service.publicado !== false,
    description: service.descricao || '',
  };
}

function buildServicePayload(service) {
  return {
    nome: service.name,
    descricao: service.description,
    categoria: service.category,
    preco: parsePrice(service.price),
    duracaoMinutos: parseDuration(service.duration),
    ativo: service.active,
    publicado: service.published,
  };
}

function buildAppointmentPayload(form) {
  return {
    nome: form.client,
    telefone: form.phone,
    email: form.email,
    servicoId: Number(form.serviceId),
    dataHora: `${form.date}T${form.time}:00`,
    observacao: form.notes || '',
  };
}

async function loginAdmin(email, senha) {
  return apiRequest('/auth/login', {
    body: { email, senha },
    method: 'POST',
  });
}

async function bootstrapFirstUser(email, senha) {
  const nome = email.split('@')[0] || 'Admin Lumiere';

  return apiRequest('/usuarios/bootstrap', {
    body: {
      email,
      nome,
      senha,
      telefone: '00000000000',
    },
    method: 'POST',
  });
}

async function fetchAppointments(auth, filters = {}) {
  const query = new URLSearchParams();

  if (filters.status && filters.status !== 'todos') {
    query.set('status', filters.status);
  }

  if (filters.busca) {
    query.set('busca', filters.busca);
  }

  const path = query.size ? `/agendamentos?${query.toString()}` : '/agendamentos';
  const payload = await apiRequest(path, { auth });
  return Array.isArray(payload) ? payload.map(normalizeAppointment) : [];
}

async function createAppointment(auth, form) {
  const payload = await apiRequest('/agendamentos', {
    auth,
    body: buildAppointmentPayload(form),
    method: 'POST',
  });
  return normalizeAppointment(payload);
}

async function updateAppointmentStatus(auth, id, status, updatePayload) {
  const actionPath = statusActionPath[status];

  if (!actionPath) {
    throw new Error('Status nao suportado pelo backend.');
  }

  const payload = await apiRequest(`/agendamentos/${id}/${actionPath}`, {
    auth,
    body: status === 'remarcar' ? updatePayload : undefined,
    method: 'PUT',
  });

  return normalizeAppointment(payload);
}

async function fetchClients(auth, busca = '') {
  const query = new URLSearchParams();

  if (busca) {
    query.set('busca', busca);
  }

  const path = query.size ? `/clientes?${query.toString()}` : '/clientes';
  const payload = await apiRequest(path, { auth });
  return Array.isArray(payload) ? payload.map(normalizeClient) : [];
}

async function fetchServices(auth) {
  const payload = await apiRequest('/servicos/admin', { auth });
  return Array.isArray(payload) ? payload.map(normalizeService) : [];
}

async function saveService(auth, service) {
  const isEditing = Boolean(service.id);
  const payload = await apiRequest(isEditing ? `/servicos/${service.id}` : '/servicos', {
    auth,
    body: buildServicePayload(service),
    method: isEditing ? 'PUT' : 'POST',
  });

  return normalizeService(payload);
}

export {
  API_BASE_URL,
  bootstrapFirstUser,
  createAppointment,
  fetchAppointments,
  fetchClients,
  fetchServices,
  loginAdmin,
  saveService,
  updateAppointmentStatus,
};
