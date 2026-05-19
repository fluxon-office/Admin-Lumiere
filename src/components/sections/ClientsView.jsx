import { createWhatsAppLink, normalizePhone } from '../../utils/contactUtils';
import { formatDate } from '../../utils/dateUtils';

function ClientsView({ clients, onClientSelect, search, onSearchChange }) {
  return (
    <section className="panel-stack" id="clientes">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Relacionamento</p>
          <h2>Clientes cadastrados</h2>
        </div>
        <input aria-label="Buscar cliente" placeholder="Buscar cliente" value={search} onChange={(event) => onSearchChange(event.target.value)} />
      </div>

      <div className="client-grid">
        {clients.map((client) => (
          <button className="client-card" key={client.id || client.email} type="button" onClick={() => onClientSelect(client)}>
            <div className="client-avatar">{client.name.slice(0, 1)}</div>
            <div>
              <h3>{client.name}</h3>
              <p>{client.email}</p>
              <p>{client.phone}</p>
            </div>
            <div className="client-footer">
              <span>{client.lastService}</span>
              <strong>
                {client.nextVisit === 'Sem retorno marcado'
                  ? client.nextVisit
                  : `${formatDate(client.nextVisit.slice(0, 10))} as ${client.nextVisit.slice(11, 16)}`}
              </strong>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ClientDetail({ client, appointments, onClose }) {
  if (!client) {
    return null;
  }

  const clientAppointments = appointments.filter((appointment) => appointment.email === client.email);

  return (
    <div className="client-detail">
      <div className="detail-header">
        <div>
          <p className="eyebrow">Cliente</p>
          <h2>{client.name}</h2>
        </div>
        <button className="icon-close" type="button" onClick={onClose}>Fechar</button>
      </div>
      <div className="detail-grid">
        <span>
          <small>Telefone</small>
          <strong>{client.phone}</strong>
        </span>
        <span>
          <small>E-mail</small>
          <strong>{client.email}</strong>
        </span>
      </div>
      <div className="contact-actions">
        <a href={createWhatsAppLink(client.phone)} target="_blank" rel="noreferrer">WhatsApp</a>
        <a href={`tel:${normalizePhone(client.phone)}`}>Ligar</a>
      </div>
      <section className="history-list">
        <h3>Historico de atendimentos</h3>
        {clientAppointments.map((appointment) => (
          <p key={appointment.id}>{appointment.service} em {formatDate(appointment.date)} as {appointment.time}</p>
        ))}
      </section>
    </div>
  );
}

export { ClientDetail };
export default ClientsView;
