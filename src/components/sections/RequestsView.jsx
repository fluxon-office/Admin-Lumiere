import { statusLabels, statusTone } from '../../data/adminData';
import { createWhatsAppLink, normalizePhone } from '../../utils/contactUtils';
import { formatDate } from '../../utils/dateUtils';

function RequestsView({ appointments, onStatusChange }) {
  const requests = appointments.filter((appointment) => ['pendente', 'remarcar'].includes(appointment.status));

  function handleStatusChange(appointmentId, status) {
    onStatusChange(appointmentId, status);
  }

  return (
    <section className="panel-stack" id="solicitacoes">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Fila de atendimento</p>
          <h2>Solicitações que precisam de ação</h2>
        </div>
        <span>{requests.length} em aberto</span>
      </div>

      <div className="request-grid">
        {requests.map((appointment) => (
          <article className="request-card" key={appointment.id}>
            <div className="request-card-header">
              <span className={`status-badge ${statusTone[appointment.status]}`}>{statusLabels[appointment.status]}</span>
              <small>{appointment.source}</small>
            </div>
            <h3>{appointment.client}</h3>
            <p>{appointment.service} em {formatDate(appointment.date)} às {appointment.time}</p>
            <div className="request-contact">
              <span>{appointment.phone}</span>
              <span>{appointment.email}</span>
            </div>
            <div className="contact-actions">
              <a href={createWhatsAppLink(appointment.phone, `Olá, ${appointment.client}. Podemos confirmar seu atendimento na Lumiere Clinic?`)} target="_blank" rel="noreferrer">WhatsApp</a>
              <a href={`tel:${normalizePhone(appointment.phone)}`}>Ligar</a>
            </div>
            <div className="action-row">
              <button className="button-confirm" onClick={() => handleStatusChange(appointment.id, 'confirmado')}>Confirmar</button>
              <button className="button-reschedule" onClick={() => handleStatusChange(appointment.id, 'remarcar')}>Remarcar</button>
              <button className="button-cancel" onClick={() => handleStatusChange(appointment.id, 'cancelado')}>Cancelar</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RequestsView;
