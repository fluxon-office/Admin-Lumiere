import { useEffect, useState } from 'react';
import { formatPhone } from '../../utils/contactUtils';

function RescheduleModal({ appointment, onClose, onSubmit, open }) {
  const [form, setForm] = useState({ date: '', time: '', notes: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !appointment) {
      return;
    }

    setForm({
      date: appointment.date || new Date().toISOString().slice(0, 10),
      time: appointment.time || '09:00',
      notes: appointment.notes === 'Sem observacoes registradas.' ? '' : (appointment.notes || ''),
      phone: appointment.phone || '',
    });
  }, [appointment, open]);

  if (!open || !appointment) {
    return null;
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        dataHora: `${form.date}T${form.time}:00`,
        observacao: form.notes,
        telefone: form.phone,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-panel" aria-label="Remarcar agendamento" onClick={(event) => event.stopPropagation()}>
        <div className="detail-header">
          <div>
            <p className="eyebrow">Remarcacao</p>
            <h2>{appointment.client}</h2>
          </div>
          <button className="icon-close" type="button" onClick={onClose}>Fechar</button>
        </div>

        <form className="service-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Nova data
              <input required min={new Date().toISOString().slice(0, 10)} type="date" value={form.date} onChange={(event) => updateField('date', event.target.value)} />
            </label>
            <label>
              Novo horario
              <input required type="time" value={form.time} onChange={(event) => updateField('time', event.target.value)} />
            </label>
          </div>
          <label>
            Observacoes
            <textarea rows="4" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
          </label>
          <label>
            Telefone para WhatsApp
            <input
              required
              inputMode="tel"
              maxLength="15"
              placeholder="(11) 99999-9999"
              value={form.phone}
              onChange={(event) => updateField('phone', formatPhone(event.target.value))}
            />
          </label>
          <button className="primary-action" disabled={saving} type="submit">
            {saving ? 'Salvando...' : 'Salvar remarcacao'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default RescheduleModal;
