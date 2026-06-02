import { scoreQuestionnaire } from './scoring.js';

function toTimestamp(value) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function buildQuestionnaireSummaries(questionnaires = [], responses = []) {
  return questionnaires
    .map((questionnaire) => {
      const related = responses
        .filter((response) => response.questionnaireId === questionnaire.id)
        .slice()
        .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));

      const latestResponse = related[0] ?? null;
      const latestScore = latestResponse ? scoreQuestionnaire(questionnaire, latestResponse.answers) : null;
      const averageScore =
        related.length === 0
          ? 0
          : Math.round(
              related.reduce((acc, response) => acc + scoreQuestionnaire(questionnaire, response.answers).score, 0) /
                related.length,
            );
      const averageCompletion =
        related.length === 0
          ? 0
          : Math.round(
              related.reduce(
                (acc, response) => acc + scoreQuestionnaire(questionnaire, response.answers).completionRate,
                0,
              ) / related.length,
            );

      return {
        ...questionnaire,
        relatedCount: related.length,
        averageScore,
        averageCompletion,
        latestBand: latestScore?.band ?? 'Sem dados',
        latestCompletionRate: latestScore?.completionRate ?? 0,
        latestScore: latestScore?.score ?? 0,
        latestResponseAt: latestResponse?.createdAt ?? null,
        latestRespondent: latestResponse?.respondentName ?? '',
      };
    })
    .sort((a, b) => {
      if (b.relatedCount !== a.relatedCount) return b.relatedCount - a.relatedCount;
      if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
      return a.title.localeCompare(b.title);
    });
}

export function buildDashboardMetrics(questionnaires = [], responses = []) {
  const summaries = buildQuestionnaireSummaries(questionnaires, responses);
  const total = questionnaires.length;
  const active = questionnaires.filter((questionnaire) => questionnaire.status === 'active').length;
  const drafts = questionnaires.filter((questionnaire) => questionnaire.status === 'draft').length;
  const archived = questionnaires.filter((questionnaire) => questionnaire.status === 'archived').length;
  const covered = summaries.filter((summary) => summary.relatedCount > 0).length;
  const averageCompletion = total
    ? Math.round(summaries.reduce((acc, summary) => acc + summary.latestCompletionRate, 0) / total)
    : 0;
  const averageScore = total
    ? Math.round(summaries.reduce((acc, summary) => acc + summary.averageScore, 0) / total)
    : 0;
  const latestResponse = responses
    .slice()
    .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))[0] ?? null;

  return {
    summaries,
    counts: {
      total,
      active,
      drafts,
      archived,
      covered,
      responses: responses.length,
    },
    latestResponse,
    averageCompletion,
    averageScore,
    coverage: total ? Math.round((covered / total) * 100) : 0,
  };
}
