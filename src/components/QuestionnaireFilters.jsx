export default function QuestionnaireFilters({ query, domain, domains, onChange, onClear }) {
  return (
    <div className="filters-bar">
      <label className="field">
        <span>Buscar</span>
        <input
          value={query}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="Procure por título, pergunta ou tema"
        />
      </label>

      <label className="field">
        <span>Categoria</span>
        <select value={domain} onChange={(event) => onChange({ domain: event.target.value })}>
          <option value="all">Todas</option>
          {domains.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <button className="ghost-button filters-reset" type="button" onClick={onClear}>
        Limpar
      </button>
    </div>
  );
}
