import { scoreQuestionnaire } from './scoring.js';

function escapeCsv(value) {
  const text = String(value ?? '');
  if (/[",\n;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function triggerDownload(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export function exportSnapshotJson(questionnaires, responses) {
  const snapshot = {
    exportedAt: new Date().toISOString(),
    questionnaires,
    responses,
  };

  triggerDownload(`forms-snapshot-${timestamp()}.json`, JSON.stringify(snapshot, null, 2), 'application/json');
}

export function exportResponsesCsv(questionnaires, responses) {
  const headers = ['questionnaire', 'respondent', 'unit', 'score', 'band', 'answered_at', 'notes'];
  const rows = responses.map((response) => {
    const questionnaire = questionnaires.find((item) => item.id === response.questionnaireId);
    return [
      questionnaire?.title ?? response.questionnaireId,
      response.respondentName ?? '',
      response.unit ?? '',
      response.score ?? '',
      response.band ?? '',
      response.createdAt ?? '',
      response.notes ?? '',
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(';'))
    .join('\n');

  triggerDownload(`forms-responses-${timestamp()}.csv`, csv, 'text/csv;charset=utf-8');
}

export function exportQuestionnaireSummaryCsv(questionnaires, responses) {
  const headers = ['questionnaire', 'responses', 'average_score', 'latest_band', 'latest_completion'];
  const rows = questionnaires.map((questionnaire) => {
    const related = responses.filter((response) => response.questionnaireId === questionnaire.id);
    const latest = related[0] ? scoreQuestionnaire(questionnaire, related[0].answers) : null;
    const averageScore =
      related.length === 0
        ? 0
        : Math.round(
            related.reduce((acc, response) => acc + scoreQuestionnaire(questionnaire, response.answers).score, 0) /
              related.length,
          );

    return [
      questionnaire.title,
      related.length,
      averageScore,
      latest?.band ?? 'Sem dados',
      latest?.completionRate ?? 0,
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(';'))
    .join('\n');

  triggerDownload(`forms-questionnaires-${timestamp()}.csv`, csv, 'text/csv;charset=utf-8');
}
