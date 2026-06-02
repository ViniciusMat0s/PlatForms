import { useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import QuestionnaireCard from './components/QuestionnaireCard';
import QuestionnaireEditor from './components/QuestionnaireEditor';
import QuestionnaireRunner from './components/QuestionnaireRunner';
import ResultsPanel from './components/ResultsPanel';
import { seedQuestionnaires } from './data/seed';
import { createQuestionnaireId } from './lib/scoring';
import { loadState, saveState } from './lib/storage';

const QUESTIONNAIRES_KEY = 'forms-platform.questionnaires';
const RESPONSES_KEY = 'forms-platform.responses';

function createBlankQuestionnaire() {
  return {
    id: createQuestionnaireId(`Novo questionário ${Date.now()}`),
    title: 'Novo questionário',
    subtitle: 'Descreva o objetivo do instrumento.',
    audience: 'Adulto',
    domain: 'Personalizado',
    source: 'Rascunho local',
    scale: {
      id: 'likert-5',
      labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
      values: [0, 1, 2, 3, 4],
    },
    bands: [
      { min: 0, max: 19, label: 'Muito baixo' },
      { min: 20, max: 39, label: 'Baixo' },
      { min: 40, max: 59, label: 'Moderado' },
      { min: 60, max: 79, label: 'Alto' },
      { min: 80, max: 100, label: 'Muito alto' },
    ],
    questions: [{ id: `q-${Date.now()}`, text: 'Digite a primeira pergunta', reverse: false }],
  };
}

function createQuestion() {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: 'Nova pergunta',
    reverse: false,
  };
}

export default function App() {
  const [questionnaires, setQuestionnaires] = useState(() =>
    loadState(QUESTIONNAIRES_KEY, seedQuestionnaires),
  );
  const [responses, setResponses] = useState(() => loadState(RESPONSES_KEY, []));
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState(
    () => questionnaires[0]?.id ?? null,
  );

  const selectedQuestionnaire = useMemo(
    () => questionnaires.find((item) => item.id === selectedQuestionnaireId) ?? questionnaires[0] ?? null,
    [questionnaires, selectedQuestionnaireId],
  );

  const dashboardStats = useMemo(
    () => ({
      questionnaireCount: questionnaires.length,
      responseCount: responses.length,
      selectedCount: selectedQuestionnaire?.questions.length ?? 0,
    }),
    [questionnaires.length, responses.length, selectedQuestionnaire],
  );

  const persistQuestionnaires = (nextQuestionnaires) => {
    setQuestionnaires(nextQuestionnaires);
    saveState(QUESTIONNAIRES_KEY, nextQuestionnaires);
  };

  const persistResponses = (nextResponses) => {
    setResponses(nextResponses);
    saveState(RESPONSES_KEY, nextResponses);
  };

  const updateQuestionnaire = (questionnaireId, nextQuestionnaire) => {
    const nextQuestionnaires = questionnaires.map((questionnaire) =>
      questionnaire.id === questionnaireId ? nextQuestionnaire : questionnaire,
    );
    persistQuestionnaires(nextQuestionnaires);
  };

  const addQuestion = (questionnaireId) => {
    const nextQuestionnaires = questionnaires.map((questionnaire) =>
      questionnaire.id === questionnaireId
        ? { ...questionnaire, questions: [...questionnaire.questions, createQuestion()] }
        : questionnaire,
    );
    persistQuestionnaires(nextQuestionnaires);
  };

  const removeQuestion = (questionnaireId, questionId) => {
    const nextQuestionnaires = questionnaires.map((questionnaire) =>
      questionnaire.id === questionnaireId
        ? { ...questionnaire, questions: questionnaire.questions.filter((question) => question.id !== questionId) }
        : questionnaire,
    );
    persistQuestionnaires(nextQuestionnaires);
  };

  const createQuestionnaire = () => {
    const draft = createBlankQuestionnaire();
    const nextQuestionnaires = [draft, ...questionnaires];
    persistQuestionnaires(nextQuestionnaires);
    setSelectedQuestionnaireId(draft.id);
    setActiveView('construtor');
  };

  const handleResponseSubmit = (payload) => {
    const next = [
      {
        id: `resp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...payload,
      },
      ...responses,
    ];
    persistResponses(next);
    setActiveView('resultados');
  };

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        onChangeView={setActiveView}
        questionnaireCount={dashboardStats.questionnaireCount}
        responseCount={dashboardStats.responseCount}
      />

      <main className="main-content">
        <header className="hero">
          <div>
            <span className="eyebrow">Plataforma de formulários</span>
            <h1>Base pronta para cadastrar, responder e analisar questionários.</h1>
            <p>
              Começamos com uma fundação genérica, pensada para acomodar as escalas do
              levantamento e crescer para painel, relatórios e automações depois.
            </p>
          </div>
          <div className="hero-stack">
            <div className="hero-card">
              <span>Questionário selecionado</span>
              <strong>{selectedQuestionnaire?.title ?? 'Nenhum'}</strong>
            </div>
            <div className="hero-card accent">
              <span>Perguntas no selecionado</span>
              <strong>{dashboardStats.selectedCount}</strong>
            </div>
          </div>
        </header>

        {activeView === 'dashboard' && (
          <section className="dashboard-grid">
            <article className="panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">Resumo</span>
                  <h2>Visão geral</h2>
                </div>
                <button className="primary-button" onClick={createQuestionnaire} type="button">
                  Novo questionário
                </button>
              </div>

              <div className="metrics-grid">
                <article className="metric-card">
                  <span>Questionários</span>
                  <strong>{dashboardStats.questionnaireCount}</strong>
                </article>
                <article className="metric-card">
                  <span>Respostas</span>
                  <strong>{dashboardStats.responseCount}</strong>
                </article>
                <article className="metric-card">
                  <span>Estado</span>
                  <strong>Base local</strong>
                </article>
              </div>

              <div className="section-title">
                <h3>Biblioteca inicial</h3>
                <p>Questionários importados como sementes do sistema.</p>
              </div>

              <div className="cards-grid">
                {questionnaires.map((questionnaire) => (
                  <QuestionnaireCard
                    key={questionnaire.id}
                    questionnaire={questionnaire}
                    isSelected={questionnaire.id === selectedQuestionnaireId}
                    onSelect={setSelectedQuestionnaireId}
                  />
                ))}
              </div>
            </article>

            <ResultsPanel questionnaires={questionnaires} responses={responses} />
          </section>
        )}

        {activeView === 'biblioteca' && (
          <section className="panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">Biblioteca</span>
                <h2>Modelos disponíveis</h2>
              </div>
              <button className="primary-button" onClick={createQuestionnaire} type="button">
                Criar modelo
              </button>
            </div>
            <div className="cards-grid">
              {questionnaires.map((questionnaire) => (
                <QuestionnaireCard
                  key={questionnaire.id}
                  questionnaire={questionnaire}
                  isSelected={questionnaire.id === selectedQuestionnaireId}
                  onSelect={setSelectedQuestionnaireId}
                />
              ))}
            </div>
          </section>
        )}

        {activeView === 'construtor' && (
          <QuestionnaireEditor
            key={selectedQuestionnaire?.id ?? 'no-questionnaire'}
            questionnaire={selectedQuestionnaire}
            onUpdateQuestionnaire={updateQuestionnaire}
            onAddQuestion={addQuestion}
            onRemoveQuestion={removeQuestion}
          />
        )}

        {activeView === 'responder' && (
          <QuestionnaireRunner
            key={selectedQuestionnaire?.id ?? 'no-questionnaire'}
            questionnaire={selectedQuestionnaire}
            onSubmit={handleResponseSubmit}
          />
        )}

        {activeView === 'resultados' && (
          <ResultsPanel questionnaires={questionnaires} responses={responses} />
        )}
      </main>
    </div>
  );
}
