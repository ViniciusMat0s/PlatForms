export default function QuestionnaireFilters({
  query,
  domain,
  status,
  domains,
  onChange,
  onClear,
}) {
  return (
    <div className="filters-bar">
      <label className="field">
        <span>Busca</span>
        <input
          value={query}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="Título, domínio, tag ou pergunta"
        />
      </label>

      <label className="field">
        <span>Domínio</span>
        <select value={domain} onChange={(event) => onChange({ domain: event.target.value })}>
          <option value="all">Todos</option>
          {domains.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Status</span>
        <select value={status} onChange={(event) => onChange({ status: event.target.value })}>
          <option value="all">Todos</option>
          <option value="active">Ativo</option>
          <option value="draft">Rascunho</option>
          <option value="archived">Arquivado</option>
        </select>
      </label>

      <button className="ghost-button filters-reset" type="button" onClick={onClear}>
        Limpar filtros
      </button>
    </div>
  );
}
