import { useEffect, useMemo, useState } from 'react';
import logoImage from './assets/logolumiere.jpeg';
import LoginView from './components/auth/LoginView';
import AppointmentDetail from './components/appointments/AppointmentDetail';
import AppointmentFormModal from './components/appointments/AppointmentFormModal';
import RescheduleModal from './components/appointments/RescheduleModal';
import MetricCard from './components/common/MetricCard';
import SideDrawer from './components/common/SideDrawer';
import AgendaView from './components/sections/AgendaView';
import ClientsView, { ClientDetail } from './components/sections/ClientsView';
import RequestsView from './components/sections/RequestsView';
import ServicesView from './components/sections/ServicesView';
import { navItems, sectionTitles, statusLabels } from './data/adminData';
import {
  bootstrapBusinessAccess,
  bootstrapFirstUser,
  createAppointment as createAppointmentRequest,
  deleteService as deleteServiceRequest,
  fetchAppointments,
  fetchClients,
  fetchServices,
  loginAdmin,
  requestPasswordRecoveryCode,
  resetPasswordWithCode,
  saveService as saveServiceRequest,
  updateAppointmentStatus,
} from './utils/api';

function AdminView({ auth }) {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [toast, setToast] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [activeSection, setActiveSection] = useState('agenda');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [agendaRange, setAgendaRange] = useState('dia');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [serviceFilters, setServiceFilters] = useState({
    name: '',
    category: 'todos',
    status: 'todos',
    professional: '',
  });
  const [detailOpen, setDetailOpen] = useState(false);
  const [clientDetail, setClientDetail] = useState(null);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const appointmentSearch = useMemo(
    () => [globalSearch.trim(), search.trim()].filter(Boolean).join(' ').trim(),
    [globalSearch, search],
  );

  async function loadServices(currentAuth, currentFilters) {
    const servicesPayload = await fetchServices(currentAuth, currentFilters);
    setServices(servicesPayload);
  }

  useEffect(() => {
    let ignore = false;

    async function loadServicesData() {
      try {
        const servicesPayload = await fetchServices(auth, serviceFilters);

        if (!ignore) {
          setServices(servicesPayload);
        }
      } catch (error) {
        if (!ignore) {
          setToast(error.message || 'Nao foi possivel carregar os servicos.');
        }
      }
    }

    loadServicesData();

    return () => {
      ignore = true;
    };
  }, [auth, serviceFilters]);

  useEffect(() => {
    let ignore = false;
    setLoadingData(true);

    async function loadAppointments() {
      try {
        const appointmentsPayload = await fetchAppointments(auth, {
          busca: appointmentSearch,
          status: activeFilter,
        });

        if (ignore) {
          return;
        }

        setAppointments(appointmentsPayload);
        setSelectedId((current) => {
          if (appointmentsPayload.some((appointment) => appointment.id === current)) {
            return current;
          }

          return appointmentsPayload[0]?.id ?? null;
        });
      } catch (error) {
        if (!ignore) {
          setToast(error.message || 'Nao foi possivel carregar os agendamentos.');
        }
      } finally {
        if (!ignore) {
          setLoadingData(false);
        }
      }
    }

    loadAppointments();

    return () => {
      ignore = true;
    };
  }, [activeFilter, appointmentSearch, auth]);

  useEffect(() => {
    let ignore = false;

    async function loadClients() {
      try {
        const clientsPayload = await fetchClients(auth, [globalSearch.trim(), clientSearch.trim()].filter(Boolean).join(' '));

        if (!ignore) {
          setClients(clientsPayload);
        }
      } catch (error) {
        if (!ignore) {
          setToast(error.message || 'Nao foi possivel carregar os clientes.');
        }
      }
    }

    loadClients();

    return () => {
      ignore = true;
    };
  }, [auth, clientSearch, globalSearch]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredAppointments = useMemo(() => appointments.filter((appointment) => {
    if (agendaRange === 'dia') {
      return appointment.date === selectedDate;
    }

    return true;
  }), [agendaRange, appointments, selectedDate]);

  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedId) ?? filteredAppointments[0];

  const metrics = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter((item) => item.status === 'pendente').length,
    confirmed: appointments.filter((item) => item.status === 'confirmado').length,
    reschedule: appointments.filter((item) => item.status === 'remarcar').length,
  }), [appointments]);

  function syncUpdatedAppointment(updatedAppointment) {
    setAppointments((current) => current.map((appointment) => (
      appointment.id === updatedAppointment.id ? updatedAppointment : appointment
    )));
  }

  async function refreshClients() {
    const clientsPayload = await fetchClients(auth, [globalSearch.trim(), clientSearch.trim()].filter(Boolean).join(' '));
    setClients(clientsPayload);
  }

  async function updateStatus(id, status, payload) {
    if (status === 'cancelado') {
      const appointment = appointments.find((item) => item.id === id);
      const confirmed = window.confirm(`Cancelar o agendamento de ${appointment?.client ?? 'cliente selecionada'}?`);

      if (!confirmed) {
        return;
      }
    }

    if (status === 'remarcar' && !payload) {
      const appointment = appointments.find((item) => item.id === id) ?? null;
      setRescheduleTarget(appointment);
      setRescheduleModalOpen(true);
      return;
    }

    try {
      const updatedAppointment = await updateAppointmentStatus(auth, id, status, payload);
      syncUpdatedAppointment(updatedAppointment);
      await refreshClients();
      setToast(`Agendamento ${statusLabels[status].toLowerCase()} com sucesso.`);
    } catch (error) {
      setToast(error.message || 'Nao foi possivel atualizar o agendamento.');
      throw error;
    }
  }

  function selectAppointment(id) {
    setSelectedId(id);
    setDetailOpen(true);
  }

  async function createAppointment(form) {
    try {
      const appointment = await createAppointmentRequest(auth, form);

      setAppointments((current) => [appointment, ...current]);
      setSelectedId(appointment.id);
      setSelectedDate(appointment.date);
      setActiveSection('agenda');
      setDetailOpen(true);
      await refreshClients();
      setToast('Agendamento criado com sucesso.');
    } catch (error) {
      setToast(error.message || 'Nao foi possivel criar o agendamento.');
      throw error;
    }
  }

  async function saveService(service) {
    try {
      await saveServiceRequest(auth, service);
      await loadServices(auth, serviceFilters);
      setToast(service.id ? 'Servico atualizado com sucesso.' : 'Servico cadastrado com sucesso.');
    } catch (error) {
      setToast(error.message || 'Nao foi possivel salvar o servico.');
      throw error;
    }
  }

  async function toggleService(id, field) {
    const service = services.find((item) => item.id === id);

    if (!service) {
      return;
    }

    await saveService({
      ...service,
      [field]: !service[field],
    });
    setToast(field === 'published' ? 'Visibilidade no site atualizada.' : 'Status do servico atualizado.');
  }

  async function deleteService(id, name) {
    const confirmed = window.confirm(`Excluir o servico ${name}?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteServiceRequest(auth, id);
      await loadServices(auth, serviceFilters);
      setToast('Servico excluido com sucesso.');
    } catch (error) {
      setToast(error.message || 'Nao foi possivel excluir o servico.');
    }
  }

  function updateServiceFilter(field, value) {
    setServiceFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetServiceFilters() {
    setServiceFilters({
      name: '',
      category: 'todos',
      status: 'todos',
      professional: '',
    });
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <img className="sidebar-logo" src={logoImage} alt="Lumiere Clinic" />
          <div>
            <strong>Lumiere</strong>
            <span>Admin</span>
          </div>
        </div>
        <nav aria-label="Navegacao principal">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={activeSection === item.id ? 'active' : ''}
              type="button"
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Painel administrativo</p>
            <h1>{sectionTitles[activeSection]}</h1>
          </div>
          <div className="topbar-actions">
            <input
              aria-label="Busca global"
              placeholder="Buscar cliente, telefone ou servico"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
            />
            <button type="button" onClick={() => setAppointmentModalOpen(true)}>Novo agendamento</button>
            <button type="button" onClick={() => setActiveSection('solicitacoes')}>Pendencias</button>
          </div>
          <div className="operator">
            <span>{auth.nome ? 'Operador' : 'Recepcao'}</span>
            <strong>{auth.nome || 'Lumiere'}</strong>
          </div>
        </header>

        <section className="metric-grid" aria-label="Resumo da agenda">
          <MetricCard marker="+" label="Total" value={metrics.total} detail="registros na operacao" tone="metric-neutral" />
          <MetricCard marker="!" label="Pendentes" value={metrics.pending} detail="aguardando contato" tone="metric-warning" />
          <MetricCard marker="OK" label="Confirmados" value={metrics.confirmed} detail="agenda validada" tone="metric-success" />
          <MetricCard marker="R" label="Remarcacao" value={metrics.reschedule} detail="precisam de novo horario" tone="metric-info" />
        </section>

        <div className="tablet-quick-actions">
          <button type="button" onClick={() => setAppointmentModalOpen(true)}>Novo agendamento</button>
          <button type="button" onClick={() => setActiveSection('solicitacoes')}>Pendencias</button>
        </div>

        {loadingData ? (
          <section className="calendar-empty">
            Carregando agenda e servicos do backend...
          </section>
        ) : null}

        {!loadingData && activeSection === 'agenda' && (
          <AgendaView
            activeFilter={activeFilter}
            agendaRange={agendaRange}
            filteredAppointments={filteredAppointments}
            onFilterChange={setActiveFilter}
            onRangeChange={setAgendaRange}
            onSelectedDateChange={setSelectedDate}
            onSearchChange={setSearch}
            onSelect={selectAppointment}
            onStatusChange={updateStatus}
            search={search}
            selectedDate={selectedDate}
            selectedAppointment={selectedAppointment}
          />
        )}
        {!loadingData && activeSection === 'solicitacoes' && <RequestsView appointments={appointments} onStatusChange={updateStatus} />}
        {!loadingData && activeSection === 'clientes' && (
          <ClientsView clients={clients} onClientSelect={setClientDetail} onSearchChange={setClientSearch} search={clientSearch} />
        )}
        {!loadingData && activeSection === 'servicos' && (
          <ServicesView
            filters={serviceFilters}
            onFilterChange={updateServiceFilter}
            onFiltersReset={resetServiceFilters}
            onServiceDelete={deleteService}
            services={services}
            onServiceSave={saveService}
            onServiceToggle={toggleService}
          />
        )}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Navegacao mobile">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={activeSection === item.id ? 'active' : ''}
            type="button"
            onClick={() => setActiveSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <SideDrawer open={detailOpen} title="Detalhe do agendamento" onClose={() => setDetailOpen(false)}>
        <AppointmentDetail
          appointment={selectedAppointment}
          onClose={() => setDetailOpen(false)}
          onStatusChange={updateStatus}
        />
      </SideDrawer>

      <SideDrawer open={Boolean(clientDetail)} title="Detalhe da cliente" onClose={() => setClientDetail(null)}>
        <ClientDetail
          appointments={appointments}
          client={clientDetail}
          onClose={() => setClientDetail(null)}
        />
      </SideDrawer>

      <AppointmentFormModal
        open={appointmentModalOpen}
        services={services}
        onClose={() => setAppointmentModalOpen(false)}
        onSubmit={createAppointment}
      />
      <RescheduleModal
        appointment={rescheduleTarget}
        open={rescheduleModalOpen}
        onClose={() => {
          setRescheduleModalOpen(false);
          setRescheduleTarget(null);
        }}
        onSubmit={(payload) => updateStatus(rescheduleTarget.id, 'remarcar', payload)}
      />
      {toast && <div className="toast-message" role="status">{toast}</div>}
    </div>
  );
}

function App() {
  const [auth, setAuth] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginNotice, setLoginNotice] = useState('');
  const [recoveryCodeSent, setRecoveryCodeSent] = useState(false);

  async function handleLogin({ email, senha }) {
    setLoginError('');
    setLoginNotice('');
    setLoginLoading(true);

    try {
      const response = await loginAdmin(email, senha);
      setAuth({
        email,
        nome: response?.nome || email,
        senha,
      });
    } catch (error) {
      setLoginError(error.message || 'Nao foi possivel entrar no painel.');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleBootstrap(payload) {
    setLoginError('');
    setLoginNotice('');
    setLoginLoading(true);

    try {
      const isLegacyPayload = Boolean(payload.email && payload.senha);
      const accessEmail = isLegacyPayload ? payload.email : payload.ownerEmail;
      const accessPassword = isLegacyPayload ? payload.senha : payload.password;

      if (!isLegacyPayload && payload.password !== payload.confirmPassword) {
        throw new Error('As senhas precisam ser iguais para criar o primeiro acesso.');
      }

      if (isLegacyPayload) {
        await bootstrapFirstUser(accessEmail, accessPassword);
      } else {
        await bootstrapBusinessAccess(payload);
      }

      const response = await loginAdmin(accessEmail, accessPassword);
      setAuth({
        email: accessEmail,
        nome: response?.nome || accessEmail,
        senha: accessPassword,
      });
    } catch (error) {
      setLoginError(error.message || 'Nao foi possivel criar o primeiro acesso.');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRecoveryCodeRequest(email) {
    setLoginError('');
    setLoginNotice('');
    setLoginLoading(true);

    try {
      await requestPasswordRecoveryCode(email);
      setRecoveryCodeSent(true);
      setLoginNotice('Codigo enviado. Verifique o e-mail informado.');
    } catch (error) {
      setLoginError(error.message || 'Nao foi possivel enviar o codigo de recuperacao.');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handlePasswordReset(form) {
    setLoginError('');
    setLoginNotice('');
    setLoginLoading(true);

    try {
      if (form.password !== form.confirmPassword) {
        throw new Error('As senhas precisam ser iguais.');
      }

      await resetPasswordWithCode(form);

      setLoginNotice('Senha redefinida com sucesso. Entre com sua nova senha.');
      setRecoveryCodeSent(false);
      return true;
    } catch (error) {
      setLoginError(error.message || 'Nao foi possivel redefinir a senha.');
      return false;
    } finally {
      setLoginLoading(false);
    }
  }

  function handleTemporaryAccess() {
    setLoginError('');
    setLoginNotice('Acesso temporario liberado para revisao local.');
    setAuth({
      email: 'acesso-temporario@lumiere.local',
      nome: 'Acesso temporario',
      senha: 'temporario',
    });
  }

  if (!auth) {
    return (
      <LoginView
        error={loginError}
        loading={loginLoading}
        notice={loginNotice}
        onBootstrap={handleBootstrap}
        onLogin={handleLogin}
        onPasswordReset={handlePasswordReset}
        onRecoveryCodeRequest={handleRecoveryCodeRequest}
        onTemporaryAccess={handleTemporaryAccess}
        recoveryCodeSent={recoveryCodeSent}
      />
    );
  }

  return <AdminView auth={auth} />;
}

export default App;
