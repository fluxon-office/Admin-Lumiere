import { useRef, useState } from 'react';
import { emptyServiceForm } from '../../data/adminData';

function ServicesView({ onServiceSave, onServiceToggle, services }) {
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const serviceFormRef = useRef(null);

  function scrollToServiceForm() {
    window.setTimeout(() => {
      serviceFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  function handleEdit(service) {
    setEditingService(service.id);
    setServiceForm({
      name: service.name,
      category: service.category,
      duration: service.duration,
      price: service.price,
      description: service.description,
      active: service.active,
      published: service.published,
    });
    scrollToServiceForm();
  }

  function resetForm() {
    setEditingService(null);
    setServiceForm(emptyServiceForm);
    scrollToServiceForm();
  }

  function updateForm(field, value) {
    setServiceForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function submitService(event) {
    event.preventDefault();
    onServiceSave({
      id: editingService,
      ...serviceForm,
      name: serviceForm.name.trim(),
      description: serviceForm.description.trim(),
    });
    resetForm();
  }

  return (
    <section className="services-layout" id="servicos">
      <div className="panel-stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Catálogo</p>
            <h2>Serviços da clínica</h2>
          </div>
          <button className="primary-action" type="button" onClick={resetForm}>Novo serviço</button>
        </div>

        <div className="table-panel">
          {services.map((service) => (
            <article className="service-row" key={service.id}>
              <div>
                <strong>{service.name}</strong>
                <span>{service.category}</span>
              </div>
              <span>{service.duration}</span>
              <span>{service.price}</span>
              <span className={`service-state ${service.active ? 'is-live' : 'is-paused'}`}>
                {service.active ? 'Ativo' : 'Pausado'}
              </span>
              <span className={`service-state ${service.published ? 'is-live' : 'is-paused'}`}>
                {service.published ? 'No site' : 'Oculto'}
              </span>
              <div className="service-actions">
                <button type="button" onClick={() => handleEdit(service)}>Editar</button>
                <button type="button" onClick={() => onServiceToggle(service.id, 'active')}>
                  {service.active ? 'Pausar' : 'Ativar'}
                </button>
                <button type="button" onClick={() => onServiceToggle(service.id, 'published')}>
                  {service.published ? 'Remover do site' : 'Publicar no site'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="service-form-panel" ref={serviceFormRef}>
        <p className="eyebrow">{editingService ? 'Editar serviço' : 'Novo serviço'}</p>
        <h2>{editingService ? 'Atualizar procedimento' : 'Cadastrar procedimento'}</h2>
        <p className="form-helper">
          Serviços marcados para publicação ficam prontos para aparecer no site público quando a integração/API estiver conectada.
        </p>

        <form className="service-form" onSubmit={submitService}>
          <label>
            Nome do serviço
            <input
              required
              value={serviceForm.name}
              onChange={(event) => updateForm('name', event.target.value)}
              placeholder="Ex: Bioestimulador"
            />
          </label>
          <label>
            Categoria
            <select value={serviceForm.category} onChange={(event) => updateForm('category', event.target.value)}>
              <option>Facial</option>
              <option>Corporal</option>
              <option>Labial</option>
              <option>Bem-estar</option>
            </select>
          </label>
          <div className="form-row">
            <label>
              Duração
              <input value={serviceForm.duration} onChange={(event) => updateForm('duration', event.target.value)} />
            </label>
            <label>
              Preço
              <input value={serviceForm.price} onChange={(event) => updateForm('price', event.target.value)} />
            </label>
          </div>
          <label>
            Descrição para o site
            <textarea
              required
              value={serviceForm.description}
              onChange={(event) => updateForm('description', event.target.value)}
              rows="4"
            />
          </label>
          <div className="switch-grid">
            <label>
              <input
                checked={serviceForm.active}
                type="checkbox"
                onChange={(event) => updateForm('active', event.target.checked)}
              />
              Serviço ativo
            </label>
            <label>
              <input
                checked={serviceForm.published}
                type="checkbox"
                onChange={(event) => updateForm('published', event.target.checked)}
              />
              Publicar no site
            </label>
          </div>
          <button className="primary-action" type="submit">{editingService ? 'Salvar alterações' : 'Cadastrar serviço'}</button>
        </form>
      </aside>
    </section>
  );
}

export default ServicesView;
