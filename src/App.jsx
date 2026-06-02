import { useEffect, useMemo, useState } from 'react';
import DashboardPanel from './components/DashboardPanel';
import LoginPanel from './components/LoginPanel';
import QuestionnaireEditor from './components/QuestionnaireEditor';
import QuestionnaireRunner from './components/QuestionnaireRunner';
import ResultsPanel from './components/ResultsPanel';
import Sidebar from './components/Sidebar';
import { seedQuestionnaires } from './data/seed';
import {
  createQuestionnaire as apiCreateQuestionnaire,
  createResponse as apiCreateResponse,
  getCurrentUser,
  getState,
  login as apiLogin,
  logout as apiLogout,
  updateQuestionnaire as apiUpdateQuestionnaire,
} from './lib/api';
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

function getSelectedQuestionnaire(questionnaires, selectedQuestionnaireId) {
  return questionnaires.find((item) => item.id === selectedQuestionnaireId) ?? questionnaires[0] ?? null;
}

function getDefaultViewForRole(role) {
  return role === 'admin' ? 'dashboard' : 'responder';
}

export default function App() {
  const [authStatus, setAuthStatus] = useState('checking');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [responses, setResponses] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState('Carregando');
  const [pendingFormId, setPendingFormId] = useState('');

  const canManageContent = currentUser?.role === 'admin';

  const selectedQuestionnaire = useMemo(
    () => getSelectedQuestionnaire(questionnaires, selectedQuestionnaireId),
    [questionnaires, selectedQuestionnaireId],
  );

  const visibleQuestionnaires = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return questionnaires;

    return questionnaires.filter((questionnaire) =>
      [
        questionnaire.title,
        questionnaire.subtitle,
        questionnaire.domain,
        questionnaire.audience,
        questionnaire.source,
        ...(questionnaire.questions ?? []).map((question) => question.text),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [questionnaires, searchQuery]);

  const applyState = (nextQuestionnaires, nextResponses) => {
    setQuestionnaires(nextQuestionnaires);
    setResponses(nextResponses);
    saveState(QUESTIONNAIRES_KEY, nextQuestionnaires);
    saveState(RESPONSES_KEY, nextResponses);
    setSelectedQuestionnaireId((current) => current ?? nextQuestionnaires[0]?.id ?? null);
  };

  const hydrateState = async (role = currentUser?.role) => {
    try {
      const state = await getState();
      const nextQuestionnaires = state.questionnaires?.length ? state.questionnaires : seedQuestionnaires;
      const nextResponses = role === 'admin' ? state.responses ?? [] : [];
      applyState(nextQuestionnaires, nextResponses);
      const formId = pendingFormId || new URLSearchParams(window.location.search).get('form') || '';
      if (formId && nextQuestionnaires.some((item) => item.id === formId)) {
        setSelectedQuestionnaireId(formId);
      }
      setSyncStatus('Online');
    } catch {
      const cachedQuestionnaires = loadState(QUESTIONNAIRES_KEY, seedQuestionnaires);
      const cachedResponses = role === 'admin' ? loadState(RESPONSES_KEY, []) : [];
      applyState(cachedQuestionnaires, cachedResponses);
      const formId = pendingFormId || new URLSearchParams(window.location.search).get('form') || '';
      if (formId && cachedQuestionnaires.some((item) => item.id === formId)) {
        setSelectedQuestionnaireId(formId);
      }
      setSyncStatus('Offline');
    }
  };

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const search = new URLSearchParams(window.location.search);
      const formId = search.get('form') || '';
      if (formId) setPendingFormId(formId);

      const token = window.localStorage.getItem('forms-platform.token');
      if (!token) {
        if (!mounted) return;
        setAuthStatus('signed_out');
        setSyncStatus('Desconectado');
        return;
      }

      try {
        const user = await getCurrentUser();
        if (!mounted) return;

        setCurrentUser(user);
        setAuthStatus('signed_in');
        await hydrateState(user.role);
        setActiveView(getDefaultViewForRole(user.role));
      } catch {
        if (!mounted) return;
        window.localStorage.removeItem('forms-platform.token');
        setCurrentUser(null);
        setAuthStatus('signed_out');
        setSyncStatus('Desconectado');
      }
    }

    bootstrap().finally(() => {
      if (mounted && authStatus === 'checking') {
        setAuthStatus((current) => (current === 'checking' ? 'signed_out' : current));
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedQuestionnaireId && questionnaires[0]?.id) {
      setSelectedQuestionnaireId(questionnaires[0].id);
    }
  }, [questionnaires, selectedQuestionnaireId]);

  useEffect(() => {
    if (!currentUser) return;

    const allowedViews =
      currentUser.role === 'admin'
        ? ['dashboard', 'biblioteca', 'construtor', 'responder', 'resultados']
        : ['biblioteca', 'responder'];

    if (!allowedViews.includes(activeView)) {
      setActiveView(currentUser.role === 'leitor' ? 'biblioteca' : getDefaultViewForRole(currentUser.role));
    }
  }, [activeView, currentUser, questionnaires]);

  const handleLogin = async ({ email, password }) => {
    setAuthLoading(true);
    setAuthError('');

    try {
      const data = await apiLogin(email, password);
      setCurrentUser(data.user);
      setAuthStatus('signed_in');
      await hydrateState(data.user.role);
      setActiveView(data.user.role === 'leitor' ? 'biblioteca' : getDefaultViewForRole(data.user.role));
    } catch (error) {
      setAuthError(error.message || 'Falha ao entrar.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } finally {
      setCurrentUser(null);
      setAuthStatus('signed_out');
      setQuestionnaires([]);
      setResponses([]);
      setSelectedQuestionnaireId(null);
      setActiveView('dashboard');
      setSyncStatus('Desconectado');
      setAuthError('');
    }
  };

  const persistQuestionnaire = async (questionnaireId, nextQuestionnaire) => {
    if (!canManageContent) return;

    const nextQuestionnaires = questionnaires.map((questionnaire) =>
      questionnaire.id === questionnaireId ? nextQuestionnaire : questionnaire,
    );

    try {
      const resolvedQuestionnaire =
        authStatus === 'signed_in'
          ? await apiUpdateQuestionnaire(questionnaireId, nextQuestionnaire)
          : nextQuestionnaire;
      const resolvedQuestionnaires = questionnaires.map((questionnaire) =>
        questionnaire.id === questionnaireId ? resolvedQuestionnaire : questionnaire,
      );
      setQuestionnaires(resolvedQuestionnaires);
      saveState(QUESTIONNAIRES_KEY, resolvedQuestionnaires);
      setSyncStatus(authStatus === 'signed_in' ? 'Online' : 'Offline');
    } catch {
      setQuestionnaires(nextQuestionnaires);
      saveState(QUESTIONNAIRES_KEY, nextQuestionnaires);
      setSyncStatus('Offline');
    }
  };

  const updateQuestionnaire = (questionnaireId, nextQuestionnaire) => {
    void persistQuestionnaire(questionnaireId, nextQuestionnaire);
  };

  const addQuestion = (questionnaireId) => {
    const nextQuestionnaires = questionnaires.map((questionnaire) =>
      questionnaire.id === questionnaireId
        ? { ...questionnaire, questions: [...questionnaire.questions, createQuestion()] }
        : questionnaire,
    );

    const nextQuestionnaire = nextQuestionnaires.find((item) => item.id === questionnaireId);
    if (nextQuestionnaire) {
      void persistQuestionnaire(questionnaireId, nextQuestionnaire);
    }
  };

  const removeQuestion = (questionnaireId, questionId) => {
    const nextQuestionnaires = questionnaires.map((questionnaire) =>
      questionnaire.id === questionnaireId
        ? { ...questionnaire, questions: questionnaire.questions.filter((question) => question.id !== questionId) }
        : questionnaire,
    );

    const nextQuestionnaire = nextQuestionnaires.find((item) => item.id === questionnaireId);
    if (nextQuestionnaire) {
      void persistQuestionnaire(questionnaireId, nextQuestionnaire);
    }
  };

  const createQuestionnaire = async () => {
    if (!canManageContent) return;

    const draft = createBlankQuestionnaire();

    try {
      const created = authStatus === 'signed_in' ? await apiCreateQuestionnaire(draft) : draft;
      const resolvedQuestionnaires = [created, ...questionnaires];
      setQuestionnaires(resolvedQuestionnaires);
      saveState(QUESTIONNAIRES_KEY, resolvedQuestionnaires);
      setSelectedQuestionnaireId(created.id);
      setActiveView('construtor');
      setSyncStatus(authStatus === 'signed_in' ? 'Online' : 'Offline');
    } catch {
      const nextQuestionnaires = [draft, ...questionnaires];
      setQuestionnaires(nextQuestionnaires);
      saveState(QUESTIONNAIRES_KEY, nextQuestionnaires);
      setSelectedQuestionnaireId(draft.id);
      setActiveView('construtor');
      setSyncStatus('Offline');
    }
  };

  const handleResponseSubmit = async (payload) => {
    try {
      const created =
        authStatus === 'signed_in'
          ? await apiCreateResponse(payload)
          : {
              id: `resp-${Date.now()}`,
              createdAt: new Date().toISOString(),
              ...payload,
            };

      const next = [created, ...responses];
      setResponses(next);
      saveState(RESPONSES_KEY, next);
      setActiveView('resultados');
      setSyncStatus(authStatus === 'signed_in' ? 'Online' : 'Offline');
    } catch {
      const fallback = {
        id: `resp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...payload,
      };
      const next = [fallback, ...responses];
      setResponses(next);
      saveState(RESPONSES_KEY, next);
      setActiveView('resultados');
      setSyncStatus('Offline');
    }
  };

  const startQuestionnaire = (questionnaireId) => {
    if (questionnaireId) {
      setSelectedQuestionnaireId(questionnaireId);
    }
    setActiveView('responder');
  };

  if (authStatus === 'checking') {
    return (
      <section className="login-shell">
        <div className="login-card">
          <span className="eyebrow">Carregando</span>
          <h1>Preparando o ambiente</h1>
          <p>Estamos verificando sua sessão e carregando os dados da plataforma.</p>
        </div>
      </section>
    );
  }

  if (authStatus === 'signed_out') {
    return <LoginPanel onLogin={handleLogin} loading={authLoading} error={authError} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        onChangeView={setActiveView}
        onLogout={handleLogout}
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        questionnaires={questionnaires}
        selectedQuestionnaireId={selectedQuestionnaireId}
        onSelectQuestionnaire={setSelectedQuestionnaireId}
      />

      <main className="main-content">
        {currentUser?.role === 'leitor' && activeView === 'biblioteca' && (
          <DashboardPanel
            currentUser={currentUser}
            questionnaires={questionnaires}
            visibleQuestionnaires={visibleQuestionnaires}
            responses={responses}
            selectedQuestionnaire={selectedQuestionnaire}
            selectedQuestionnaireId={selectedQuestionnaireId}
            onCreateQuestionnaire={createQuestionnaire}
            onOpenView={setActiveView}
            onSelectQuestionnaire={setSelectedQuestionnaireId}
            onStartQuestionnaire={startQuestionnaire}
            canManageContent={false}
            activeView={activeView}
            syncStatus={syncStatus}
            readerMode
          />
        )}

        {currentUser?.role === 'admin' && (activeView === 'dashboard' || activeView === 'biblioteca') && (
          <DashboardPanel
            currentUser={currentUser}
            questionnaires={questionnaires}
            visibleQuestionnaires={visibleQuestionnaires}
            responses={responses}
            selectedQuestionnaire={selectedQuestionnaire}
            selectedQuestionnaireId={selectedQuestionnaireId}
            onCreateQuestionnaire={createQuestionnaire}
            onOpenView={setActiveView}
            onSelectQuestionnaire={setSelectedQuestionnaireId}
            onStartQuestionnaire={startQuestionnaire}
            canManageContent={canManageContent}
            activeView={activeView}
            syncStatus={syncStatus}
          />
        )}

        {currentUser?.role === 'admin' && activeView === 'construtor' && (
          <QuestionnaireEditor
            key={selectedQuestionnaire?.id ?? 'no-questionnaire'}
            questionnaire={selectedQuestionnaire}
            onUpdateQuestionnaire={updateQuestionnaire}
            onAddQuestion={addQuestion}
            onRemoveQuestion={removeQuestion}
            canEdit={canManageContent}
          />
        )}

        {activeView === 'responder' && (
          <QuestionnaireRunner
            key={selectedQuestionnaire?.id ?? 'no-questionnaire'}
            questionnaire={selectedQuestionnaire}
            onSubmit={handleResponseSubmit}
          />
        )}

        {currentUser?.role === 'admin' && activeView === 'resultados' && (
          <ResultsPanel questionnaires={questionnaires} responses={responses} />
        )}
      </main>
    </div>
  );
}
