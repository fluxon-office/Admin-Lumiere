import { useState } from 'react';
import { emptyAppointmentForm } from '../../data/adminData';

function AppointmentFormModal({ onClose, onSubmit, open, services }) {
  const [form, setForm] = useState(emptyAppointmentForm);

  if (!open) {
    return null;
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitForm(event) {
    event.preventDefault();
    onSubmit(form);
    setForm(emptyAppointmentForm);
    onClose();
  }

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-panel" aria-label="Novo agendamento" onClick={(event) => event.stopPropagation()}>
        <div className="detail-header">
          <div>
            <p className="eyebrow">Agenda</p>
            <h2>Novo agendamento</h2>
          </div>
          <button className="icon-close" type="button" onClick={onClose}>Fechar</button>
        </div>

        <form className="service-form" onSubmit={submitForm}>
          <label>
            Nome da cliente
            <input required value={form.client} onChange={(event) => updateForm('client', event.target.value)} />
          </label>
          <div className="form-row">
            <label>
              Telefone
              <input required value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} />
            </label>
            <label>
              E-mail
              <input required type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} />
            </label>
          </div>
          <label>
            Serviço
            <select value={form.service} onChange={(event) => updateForm('service', event.target.value)}>
              {services.filter((service) => service.active).map((service) => (
                <option key={service.id}>{service.name}</option>
              ))}
            </select>
          </label>
          <div className="form-row">
            <label>
              Data
              <input type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} />
            </label>
            <label>
              Horário
              <input type="time" value={form.time} onChange={(event) => updateForm('time', event.target.value)} />
            </label>
          </div>
          <label>
            Observações internas
            <textarea value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} rows="4" />
          </label>
          <button className="primary-action" type="submit">Salvar agendamento</button>
        </form>
      </section>
    </div>
  );
}

export default AppointmentFormModal;
