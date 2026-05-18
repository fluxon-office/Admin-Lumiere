import { statusLabels, statusTone } from '../../data/adminData';
import { createWhatsAppLink, normalizePhone } from '../../utils/contactUtils';
import { formatDate } from '../../utils/dateUtils';

function AppointmentDetail({ appointment, onClose, onStatusChange }) {
  if (!appointment) {
    return (
      <aside className="detail-panel empty-state">
        <h2>Nenhum agendamento selecionado</h2>
        <p>Selecione um item da agenda para ver os dados da paciente e o histórico.</p>
      </aside>
    );
  }

  return (
    <aside className="detail-panel">
      <div className="detail-header">
        <div>
          <p className="eyebrow">Agendamento #{appointment.id}</p>
          <h2>{appointment.client}</h2>
        </div>
        <div className="detail-header-actions">
          <span className={`status-badge ${statusTone[appointment.status]}`}>{statusLabels[appointment.status]}</span>
          {onClose && <button className="icon-close" type="button" onClick={onClose}>Fechar</button>}
        </div>
      </div>

      <div className="detail-grid">
        <span>
          <small>Procedimento</small>
          <strong>{appointment.service}</strong>
        </span>
        <span>
          <small>Data e horário</small>
          <strong>{formatDate(appointment.date)} às {appointment.time}</strong>
        </span>
        <span>
          <small>Telefone</small>
          <strong>{appointment.phone}</strong>
        </span>
        <span>
          <small>E-mail</small>
          <strong>{appointment.email}</strong>
        </span>
      </div>

      <div className="notes-box">
        <small>Observações</small>
        <p>{appointment.notes}</p>
      </div>

      <div className="action-row">
        <button className="button-confirm" onClick={() => onStatusChange(appointment.id, 'confirmado')}>Confirmar</button>
        <button className="button-reschedule" onClick={() => onStatusChange(appointment.id, 'remarcar')}>Remarcar</button>
        <button className="button-cancel" onClick={() => onStatusChange(appointment.id, 'cancelado')}>Cancelar</button>
      </div>

      <div className="contact-actions">
        <a href={createWhatsAppLink(appointment.phone)} target="_blank" rel="noreferrer">WhatsApp</a>
        <a href={`tel:${normalizePhone(appointment.phone)}`}>Ligar</a>
        <a href={`mailto:${appointment.email}`}>E-mail</a>
      </div>

      <section className="history-list">
        <h3>Histórico</h3>
        {appointment.history.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </section>
    </aside>
  );
}

export default AppointmentDetail;
