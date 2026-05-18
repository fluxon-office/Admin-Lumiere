import { useMemo } from 'react';
import AppointmentDetail from '../appointments/AppointmentDetail';
import AppointmentRow from '../appointments/AppointmentRow';
import { filters, statusLabels, statusTone } from '../../data/adminData';
import {
  buildMonthDays,
  buildWeekDays,
  countAppointmentsByDate,
  formatLongDate,
} from '../../utils/dateUtils';

function AgendaView({
  activeFilter,
  agendaRange,
  filteredAppointments,
  onFilterChange,
  onRangeChange,
  onSearchChange,
  onSelectedDateChange,
  onSelect,
  onStatusChange,
  search,
  selectedDate,
  selectedAppointment,
}) {
  const dayAppointments = useMemo(
    () => filteredAppointments.filter((appointment) => appointment.date === selectedDate),
    [filteredAppointments, selectedDate],
  );
  const weekDays = useMemo(() => buildWeekDays(selectedDate), [selectedDate]);
  const monthDays = useMemo(() => buildMonthDays(selectedDate), [selectedDate]);

  function renderDayAppointments() {
    if (dayAppointments.length === 0) {
      return (
        <div className="calendar-empty">
          Nenhum atendimento encontrado para {formatLongDate(selectedDate)}.
        </div>
      );
    }

    return (
      <div className="timeline-list">
        {dayAppointments.map((appointment) => (
          <button
            className="timeline-item"
            key={appointment.id}
            type="button"
            onClick={() => onSelect(appointment.id)}
          >
            <span>{appointment.time}</span>
            <strong>{appointment.client}</strong>
            <small>{appointment.service}</small>
            <span className={`status-badge ${statusTone[appointment.status]}`}>{statusLabels[appointment.status]}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <section className="calendar-panel" aria-label="Agenda por período">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">Agenda visual</p>
            <h2>Atendimentos por período</h2>
            <p className="calendar-selected-date">{formatLongDate(selectedDate)}</p>
          </div>
          <div className="range-tabs" aria-label="Período da agenda">
            {['dia', 'semana', 'mês'].map((range) => (
              <button
                key={range}
                className={agendaRange === range ? 'active' : ''}
                type="button"
                onClick={() => onRangeChange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {agendaRange === 'dia' && renderDayAppointments()}

        {agendaRange === 'semana' && (
          <>
            <div className="week-calendar">
              {weekDays.map((day) => {
                const appointmentCount = countAppointmentsByDate(filteredAppointments, day.key);
                return (
                  <button
                    className={selectedDate === day.key ? 'active' : ''}
                    key={day.key}
                    type="button"
                    onClick={() => onSelectedDateChange(day.key)}
                  >
                    <span>{day.label}</span>
                    <strong>{day.number}</strong>
                    <small>{appointmentCount} atendimento{appointmentCount === 1 ? '' : 's'}</small>
                  </button>
                );
              })}
            </div>
            {renderDayAppointments()}
          </>
        )}

        {agendaRange === 'mês' && (
          <>
            <div className="month-calendar">
              {monthDays.map((day) => {
                const appointmentCount = countAppointmentsByDate(filteredAppointments, day.key);
                return (
                  <button
                    className={`${selectedDate === day.key ? 'active' : ''} ${day.muted ? 'is-muted' : ''}`}
                    key={day.key}
                    type="button"
                    onClick={() => onSelectedDateChange(day.key)}
                  >
                    <strong>{day.number}</strong>
                    {appointmentCount > 0 && <span>{appointmentCount}</span>}
                  </button>
                );
              })}
            </div>
            {renderDayAppointments()}
          </>
        )}
      </section>

      <section className="content-grid">
        <div className="list-panel" id="agenda">
          <div className="list-toolbar">
            <div>
              <h2>Agenda operacional</h2>
              <p>{filteredAppointments.length} registros encontrados</p>
            </div>
            <input
              aria-label="Buscar agendamento"
              placeholder="Buscar paciente, serviço ou telefone"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <div className="filter-tabs" aria-label="Filtros de status">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={activeFilter === filter.id ? 'active' : ''}
                onClick={() => onFilterChange(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="appointment-list">
            {filteredAppointments.map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                active={appointment.id === selectedAppointment?.id}
                appointment={appointment}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>

        <AppointmentDetail appointment={selectedAppointment} onStatusChange={onStatusChange} />
      </section>
    </>
  );
}

export default AgendaView;
