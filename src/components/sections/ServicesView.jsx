import { useRef, useState } from 'react';
import { emptyServiceForm } from '../../data/adminData';

function ServicesView({
  filters,
  onFilterChange,
  onFiltersReset,
  onServiceDelete,
  onServiceSave,
  onServiceToggle,
  services,
}) {
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [saving, setSaving] = useState(false);
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
      professional: service.professional,
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

  async function submitService(event) {
    event.preventDefault();

    try {
      setSaving(true);
      await onServiceSave({
        id: editingService,
        ...serviceForm,
        name: serviceForm.name.trim(),
        professional: serviceForm.professional.trim(),
        description: serviceForm.description.trim(),
      });
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="services-layout" id="servicos">
      <div className="panel-stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Catalogo</p>
            <h2>Servicos da clinica</h2>
          </div>
          <button className="primary-action" type="button" onClick={resetForm}>Novo servico</button>
        </div>

        <div className="service-filters">
          <input
            placeholder="Buscar por nome"
            value={filters.name}
            onChange={(event) => onFilterChange('name', event.target.value)}
          />
          <select value={filters.category} onChange={(event) => onFilterChange('category', event.target.value)}>
            <option value="todos">Todas as categorias</option>
            <option value="Facial">Facial</option>
            <option value="Corporal">Corporal</option>
            <option value="Labial">Labial</option>
            <option value="Bem-estar">Bem-estar</option>
          </select>
          <select value={filters.status} onChange={(event) => onFilterChange('status', event.target.value)}>
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
          <input
            placeholder="Filtrar por profissional"
            value={filters.professional}
            onChange={(event) => onFilterChange('professional', event.target.value)}
          />
          <button className="secondary-action" type="button" onClick={onFiltersReset}>Limpar filtros</button>
        </div>

        <div className="table-panel">
          {services.map((service) => (
            <article className="service-row" key={service.id}>
              <div>
                <strong>{service.name}</strong>
                <span>{service.category}</span>
                <small>{service.professional}</small>
              </div>
              <span>{service.duration}</span>
              <span>{service.price}</span>
              <span className={`service-state ${service.active ? 'is-live' : 'is-paused'}`}>
                {service.active ? 'Ativo' : 'Inativo'}
              </span>
              <span className={`service-state ${service.published ? 'is-live' : 'is-paused'}`}>
                {service.published ? 'No site' : 'Oculto'}
              </span>
              <div className="service-actions">
                <button type="button" onClick={() => handleEdit(service)}>Editar</button>
                <button type="button" onClick={() => onServiceToggle(service.id, 'active')}>
                  {service.active ? 'Inativar' : 'Ativar'}
                </button>
                <button type="button" onClick={() => onServiceToggle(service.id, 'published')}>
                  {service.published ? 'Ocultar' : 'Publicar'}
                </button>
                <button className="danger-action" type="button" onClick={() => onServiceDelete(service.id, service.name)}>Excluir</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="service-form-panel" ref={serviceFormRef}>
        <p className="eyebrow">{editingService ? 'Editar servico' : 'Novo servico'}</p>
        <h2>{editingService ? 'Atualizar procedimento' : 'Cadastrar procedimento'}</h2>
        <p className="form-helper">
          Servicos ativos e publicados ficam disponiveis no fluxo publico da clinica.
        </p>

        <form className="service-form" onSubmit={submitService}>
          <label>
            Nome do servico
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
          <label>
            Profissional principal
            <input
              required
              value={serviceForm.professional}
              onChange={(event) => updateForm('professional', event.target.value)}
              placeholder="Ex: Dra. Mariana"
            />
          </label>
          <div className="form-row">
            <label>
              Duracao
              <input value={serviceForm.duration} onChange={(event) => updateForm('duration', event.target.value)} />
            </label>
            <label>
              Preco
              <input value={serviceForm.price} onChange={(event) => updateForm('price', event.target.value)} />
            </label>
          </div>
          <label>
            Descricao para o site
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
              Servico ativo
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
          <button className="primary-action" disabled={saving} type="submit">
            {saving ? 'Salvando...' : editingService ? 'Salvar alteracoes' : 'Cadastrar servico'}
          </button>
        </form>
      </aside>
    </section>
  );
}

export default ServicesView;
