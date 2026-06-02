import { useEffect, useMemo, useState } from 'react';
import DashboardPanel from './components/DashboardPanel';
import LoginPanel from './components/LoginPanel';
import QuestionnaireRunner from './components/QuestionnaireRunner';
import ResultsPanel from './components/ResultsPanel';
import Sidebar from './components/Sidebar';
import { seedQuestionnaires } from './data/seed';
import {
  createResponse as apiCreateResponse,
  getCurrentUser,
  getState,
  login as apiLogin,
  logout as apiLogout,
} from './lib/api';
import { loadState, saveState } from './lib/storage';

const QUESTIONNAIRES_KEY = 'forms-platform.questionnaires';
const RESPONSES_KEY = 'forms-platform.responses';
const allowedQuestionnaireIds = new Set(seedQuestionnaires.map((questionnaire) => questionnaire.id));

function filterAllowedQuestionnaires(questionnaires = []) {
  return questionnaires.filter((questionnaire) => allowedQuestionnaireIds.has(questionnaire.id));
}

function filterAllowedResponses(responses = []) {
  return responses.filter((response) => allowedQuestionnaireIds.has(response.questionnaireId));
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
    const sanitizedQuestionnaires = filterAllowedQuestionnaires(nextQuestionnaires);
    const sanitizedResponses = filterAllowedResponses(nextResponses);
    setQuestionnaires(sanitizedQuestionnaires);
    setResponses(sanitizedResponses);
    saveState(QUESTIONNAIRES_KEY, sanitizedQuestionnaires);
    saveState(RESPONSES_KEY, sanitizedResponses);
    setSelectedQuestionnaireId((current) => current ?? sanitizedQuestionnaires[0]?.id ?? null);
  };

  const hydrateState = async (role = currentUser?.role) => {
    try {
      const state = await getState();
      const nextQuestionnaires = state.questionnaires?.length ? state.questionnaires : seedQuestionnaires;
      const nextResponses = role === 'admin' ? state.responses ?? [] : [];
      applyState(nextQuestionnaires, nextResponses);
      const formId = pendingFormId || new URLSearchParams(window.location.search).get('form') || '';
      if (formId && filterAllowedQuestionnaires(nextQuestionnaires).some((item) => item.id === formId)) {
        setSelectedQuestionnaireId(formId);
      }
      setSyncStatus('Online');
    } catch {
      const cachedQuestionnaires = loadState(QUESTIONNAIRES_KEY, seedQuestionnaires);
      const cachedResponses = role === 'admin' ? loadState(RESPONSES_KEY, []) : [];
      applyState(cachedQuestionnaires, cachedResponses);
      const formId = pendingFormId || new URLSearchParams(window.location.search).get('form') || '';
      if (formId && filterAllowedQuestionnaires(cachedQuestionnaires).some((item) => item.id === formId)) {
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
        ? ['dashboard', 'biblioteca', 'responder', 'resultados']
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
            onOpenView={setActiveView}
            onSelectQuestionnaire={setSelectedQuestionnaireId}
            onStartQuestionnaire={startQuestionnaire}
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
            onOpenView={setActiveView}
            onSelectQuestionnaire={setSelectedQuestionnaireId}
            onStartQuestionnaire={startQuestionnaire}
            activeView={activeView}
            syncStatus={syncStatus}
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
