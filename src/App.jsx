import { useEffect, useMemo, useState } from 'react';
import logoImage from './assets/logolumiere.jpeg';
import LoginView from './components/auth/LoginView';
import AppointmentDetail from './components/appointments/AppointmentDetail';
import AppointmentFormModal from './components/appointments/AppointmentFormModal';
import MetricCard from './components/common/MetricCard';
import SideDrawer from './components/common/SideDrawer';
import AgendaView from './components/sections/AgendaView';
import ClientsView, { ClientDetail } from './components/sections/ClientsView';
import RequestsView from './components/sections/RequestsView';
import ServicesView from './components/sections/ServicesView';
import { navItems, sectionTitles, statusLabels } from './data/adminData';
import {
  bootstrapFirstUser,
  createAppointment as createAppointmentRequest,
  fetchAppointments,
  fetchServices,
  loginAdmin,
  saveService as saveServiceRequest,
  updateAppointmentStatus,
} from './utils/api';

function AdminView({ auth }) {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [toast, setToast] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [activeSection, setActiveSection] = useState('agenda');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [agendaRange, setAgendaRange] = useState('dia');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [clientDetail, setClientDetail] = useState(null);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadDashboardData() {
      setLoadingData(true);

      try {
        const [appointmentsPayload, servicesPayload] = await Promise.all([
          fetchAppointments(auth),
          fetchServices(auth),
        ]);

        if (ignore) {
          return;
        }

        setAppointments(appointmentsPayload);
        setServices(servicesPayload);
        setSelectedId(appointmentsPayload[0]?.id ?? null);
      } catch (error) {
        if (!ignore) {
          setToast(error.message || 'Nao foi possivel carregar os dados do painel.');
        }
      } finally {
        if (!ignore) {
          setLoadingData(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      ignore = true;
    };
  }, [auth]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredAppointments = useMemo(() => appointments.filter((appointment) => {
    const matchesFilter = activeFilter === 'todos' || appointment.status === activeFilter;
    const searchTarget = `${appointment.client} ${appointment.service} ${appointment.phone} ${appointment.email}`.toLowerCase();
    const localSearch = searchTarget.includes(search.toLowerCase());
    const globalMatch = searchTarget.includes(globalSearch.toLowerCase());
    return matchesFilter && localSearch && globalMatch;
  }), [activeFilter, appointments, globalSearch, search]);

  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedId) ?? filteredAppointments[0];

  const metrics = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter((item) => item.status === 'pendente').length,
    confirmed: appointments.filter((item) => item.status === 'confirmado').length,
    reschedule: appointments.filter((item) => item.status === 'remarcar').length,
  }), [appointments]);

  async function updateStatus(id, status) {
    if (status === 'cancelado') {
      const appointment = appointments.find((item) => item.id === id);
      const confirmed = window.confirm(`Cancelar o agendamento de ${appointment?.client ?? 'cliente selecionada'}?`);

      if (!confirmed) {
        return;
      }
    }

    try {
      const updatedAppointment = await updateAppointmentStatus(auth, id, status);

      setAppointments((current) => current.map((appointment) => (
        appointment.id === id ? updatedAppointment : appointment
      )));
      setToast(`Agendamento ${statusLabels[status].toLowerCase()} com sucesso.`);
    } catch (error) {
      setToast(error.message || 'Nao foi possivel atualizar o agendamento.');
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
      setToast('Agendamento criado com sucesso.');
    } catch (error) {
      setToast(error.message || 'Nao foi possivel criar o agendamento.');
      throw error;
    }
  }

  async function saveService(service) {
    try {
      const savedService = await saveServiceRequest(auth, service);

      setServices((current) => {
        if (service.id) {
          return current.map((item) => (item.id === service.id ? savedService : item));
        }

        return [savedService, ...current];
      });
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
        {!loadingData && activeSection === 'clientes' && <ClientsView appointments={appointments} onClientSelect={setClientDetail} />}
        {!loadingData && activeSection === 'servicos' && (
          <ServicesView
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
      {toast && <div className="toast-message" role="status">{toast}</div>}
    </div>
  );
}

function App() {
  const [auth, setAuth] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  async function handleLogin({ email, senha }) {
    setLoginError('');
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

  async function handleBootstrap({ email, senha }) {
    setLoginError('');
    setLoginLoading(true);

    try {
      await bootstrapFirstUser(email, senha);
      const response = await loginAdmin(email, senha);
      setAuth({
        email,
        nome: response?.nome || email,
        senha,
      });
    } catch (error) {
      setLoginError(error.message || 'Nao foi possivel criar o primeiro acesso.');
    } finally {
      setLoginLoading(false);
    }
  }

  if (!auth) {
    return (
      <LoginView
        error={loginError}
        loading={loginLoading}
        onBootstrap={handleBootstrap}
        onLogin={handleLogin}
      />
    );
  }

  return <AdminView auth={auth} />;
}

export default App;
