export default function QuestionnaireEditor({
  questionnaire,
  onUpdateQuestionnaire,
  onAddQuestion,
  onRemoveQuestion,
  canEdit = true,
}) {
  if (!questionnaire) {
    return <div className="empty-state">Escolha ou crie um formulário para começar.</div>;
  }

  const updateField = (field, value) => {
    onUpdateQuestionnaire(questionnaire.id, { ...questionnaire, [field]: value });
  };

  const updateScaleLabel = (index, value) => {
    const labels = questionnaire.scale.labels.map((label, currentIndex) =>
      currentIndex === index ? value : label,
    );
    onUpdateQuestionnaire(questionnaire.id, {
      ...questionnaire,
      scale: { ...questionnaire.scale, labels },
    });
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Editar</span>
          <h2>Formulário</h2>
          <p>Edite só o que precisar. O restante fica salvo automaticamente.</p>
        </div>
      </div>

      {!canEdit ? <div className="empty-state small">Seu perfil pode ver, mas não editar este conteúdo.</div> : null}

      <div className="editor-grid">
        <label className="field">
          <span>Título</span>
          <input
            value={questionnaire.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Nome do formulário"
            disabled={!canEdit}
          />
        </label>

        <label className="field">
          <span>Descrição curta</span>
          <input
            value={questionnaire.subtitle}
            onChange={(event) => updateField('subtitle', event.target.value)}
            placeholder="Explique o objetivo em poucas palavras"
            disabled={!canEdit}
          />
        </label>

        <label className="field">
          <span>Categoria</span>
          <input
            value={questionnaire.domain}
            onChange={(event) => updateField('domain', event.target.value)}
            placeholder="Ex: saúde mental"
            disabled={!canEdit}
          />
        </label>

        <label className="field">
          <span>Público</span>
          <input
            value={questionnaire.audience}
            onChange={(event) => updateField('audience', event.target.value)}
            placeholder="Ex: Adulto"
            disabled={!canEdit}
          />
        </label>
      </div>

      <div className="scale-editor">
        <div className="section-title">
          <div>
            <h3>Escala de resposta</h3>
            <p>Se precisar, troque só os rótulos das opções.</p>
          </div>
        </div>

        <div className="scale-pills">
          {questionnaire.scale.labels.map((label, index) => (
            <input
              key={`${questionnaire.id}-scale-${index}`}
              value={label}
              onChange={(event) => updateScaleLabel(index, event.target.value)}
              disabled={!canEdit}
            />
          ))}
        </div>
      </div>

      <div className="questions-editor">
        <div className="section-title">
          <div>
            <h3>Perguntas</h3>
            <p>Escreva cada item de forma simples e direta.</p>
          </div>
          <button
            className="ghost-button"
            onClick={() => onAddQuestion(questionnaire.id)}
            type="button"
            disabled={!canEdit}
          >
            Nova pergunta
          </button>
        </div>

        <div className="question-list">
          {questionnaire.questions.map((question, index) => (
            <div key={question.id} className="question-row">
              <span className="question-index">{index + 1}</span>
              <input
                value={question.text}
                onChange={(event) =>
                  onUpdateQuestionnaire(questionnaire.id, {
                    ...questionnaire,
                    questions: questionnaire.questions.map((item) =>
                      item.id === question.id ? { ...item, text: event.target.value } : item,
                    ),
                  })
                }
                placeholder="Digite a pergunta"
                disabled={!canEdit}
              />
              <button
                className="danger-button"
                onClick={() => onRemoveQuestion(questionnaire.id, question.id)}
                type="button"
                disabled={!canEdit}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
