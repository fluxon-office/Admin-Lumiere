import { statusLabels, statusTone } from '../../data/adminData';
import { formatDate } from '../../utils/dateUtils';

function AppointmentRow({ appointment, active, onSelect }) {
  return (
    <button className={`appointment-row ${active ? 'is-active' : ''}`} onClick={() => onSelect(appointment.id)}>
      <span className="row-date">
        <strong>{formatDate(appointment.date)}</strong>
        <small>{appointment.time}</small>
      </span>
      <span className="row-main">
        <strong>{appointment.client}</strong>
        <small>{appointment.service}</small>
      </span>
      <span className={`status-badge ${statusTone[appointment.status]}`}>{statusLabels[appointment.status]}</span>
    </button>
  );
}

export default AppointmentRow;
