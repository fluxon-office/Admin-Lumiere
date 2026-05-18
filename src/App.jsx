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
import { initialAppointments, navItems, sectionTitles, statusLabels } from './data/adminData';
import {
  loadStoredAppointments,
  loadStoredServices,
  storeAppointments,
  storeServices,
} from './utils/storageUtils';

function AdminView() {
  const [appointments, setAppointments] = useState(loadStoredAppointments);
  const [services, setServices] = useState(loadStoredServices);
  const [toast, setToast] = useState('');
  const [activeSection, setActiveSection] = useState('agenda');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [agendaRange, setAgendaRange] = useState('dia');
  const [selectedDate, setSelectedDate] = useState('2026-05-18');
  const [search, setSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [clientDetail, setClientDetail] = useState(null);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(initialAppointments[0].id);

  useEffect(() => {
    storeServices(services);
  }, [services]);

  useEffect(() => {
    storeAppointments(appointments);
  }, [appointments]);

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

  function updateStatus(id, status) {
    if (status === 'cancelado') {
      const appointment = appointments.find((item) => item.id === id);
      const confirmed = window.confirm(`Cancelar o agendamento de ${appointment?.client ?? 'cliente selecionada'}?`);

      if (!confirmed) {
        return;
      }
    }

    setAppointments((current) => current.map((appointment) => {
      if (appointment.id !== id) {
        return appointment;
      }

      return {
        ...appointment,
        status,
        history: [
          ...appointment.history,
          `${statusLabels[status]} pela recepção em 17/05 às 14:30`,
        ],
      };
    }));
    setToast(`Agendamento ${statusLabels[status].toLowerCase()} com sucesso.`);
  }

  function selectAppointment(id) {
    setSelectedId(id);
    setDetailOpen(true);
  }

  function createAppointment(form) {
    const nextId = Math.max(...appointments.map((appointment) => appointment.id), 0) + 1;
    const appointment = {
      id: nextId,
      client: form.client,
      phone: form.phone,
      email: form.email,
      service: form.service,
      date: form.date,
      time: form.time,
      status: 'pendente',
      source: 'Recepção',
      notes: form.notes || 'Agendamento criado manualmente pela recepção.',
      history: ['Criado pela recepção agora'],
    };

    setAppointments((current) => [appointment, ...current]);
    setSelectedId(nextId);
    setSelectedDate(form.date);
    setActiveSection('agenda');
    setDetailOpen(true);
    setToast('Agendamento criado com sucesso.');
  }

  function saveService(service) {
    if (service.id) {
      setServices((current) => current.map((item) => (
        item.id === service.id ? { ...item, ...service } : item
      )));
      setToast('Serviço atualizado com sucesso.');
      return;
    }

    setServices((current) => [
      {
        ...service,
        id: Math.max(...current.map((item) => item.id), 0) + 1,
      },
      ...current,
    ]);
    setToast('Serviço cadastrado com sucesso.');
  }

  function toggleService(id, field) {
    setServices((current) => current.map((service) => (
      service.id === id ? { ...service, [field]: !service[field] } : service
    )));
    setToast(field === 'published' ? 'Visibilidade no site atualizada.' : 'Status do serviço atualizado.');
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
        <nav aria-label="Navegação principal">
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
              placeholder="Buscar cliente, telefone ou serviço"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
            />
            <button type="button" onClick={() => setAppointmentModalOpen(true)}>Novo agendamento</button>
            <button type="button" onClick={() => setActiveSection('solicitacoes')}>Pendências</button>
          </div>
          <div className="operator">
            <span>Recepção</span>
            <strong>Beatriz</strong>
          </div>
        </header>

        <section className="metric-grid" aria-label="Resumo da agenda">
          <MetricCard marker="+" label="Total" value={metrics.total} detail="registros na operação" tone="metric-neutral" />
          <MetricCard marker="!" label="Pendentes" value={metrics.pending} detail="aguardando contato" tone="metric-warning" />
          <MetricCard marker="OK" label="Confirmados" value={metrics.confirmed} detail="agenda validada" tone="metric-success" />
          <MetricCard marker="R" label="Remarcação" value={metrics.reschedule} detail="precisam de novo horário" tone="metric-info" />
        </section>

        {activeSection === 'agenda' && (
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
        {activeSection === 'solicitacoes' && <RequestsView appointments={appointments} onStatusChange={updateStatus} />}
        {activeSection === 'clientes' && <ClientsView appointments={appointments} onClientSelect={setClientDetail} />}
        {activeSection === 'servicos' && (
          <ServicesView
            services={services}
            onServiceSave={saveService}
            onServiceToggle={toggleService}
          />
        )}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Navegação mobile">
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
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <LoginView onLogin={(event) => {
      event.preventDefault();
      setAuthenticated(true);
    }} />;
  }

  return <AdminView />;
}

export default App;
