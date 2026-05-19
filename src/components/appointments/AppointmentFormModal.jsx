import { useEffect, useState } from 'react';
import { emptyAppointmentForm } from '../../data/adminData';

function AppointmentFormModal({ onClose, onSubmit, open, services }) {
  const [form, setForm] = useState(emptyAppointmentForm);
  const [saving, setSaving] = useState(false);
  const activeServices = services.filter((service) => service.active);

  useEffect(() => {
    if (!open || form.serviceId || activeServices.length === 0) {
      return;
    }

    setForm((current) => ({ ...current, serviceId: String(activeServices[0].id) }));
  }, [activeServices, form.serviceId, open]);

  if (!open) {
    return null;
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitForm(event) {
    event.preventDefault();

    try {
      setSaving(true);
      await onSubmit(form);
      setForm(emptyAppointmentForm);
      onClose();
    } finally {
      setSaving(false);
    }
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
            Servico
            <select
              required
              value={form.serviceId}
              onChange={(event) => updateForm('serviceId', event.target.value)}
            >
              {activeServices.map((service) => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          </label>
          <div className="form-row">
            <label>
              Data
              <input type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} />
            </label>
            <label>
              Horario
              <input type="time" value={form.time} onChange={(event) => updateForm('time', event.target.value)} />
            </label>
          </div>
          <label>
            Observacoes internas
            <textarea value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} rows="4" />
          </label>
          <button className="primary-action" disabled={saving || activeServices.length === 0} type="submit">
            {saving ? 'Salvando...' : 'Salvar agendamento'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default AppointmentFormModal;
