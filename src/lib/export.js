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

function buildSummaries(questionnaires, responses) {
  return questionnaires.map((questionnaire) => {
    const related = responses.filter((response) => response.questionnaireId === questionnaire.id);
    const latest = related[0] ? scoreQuestionnaire(questionnaire, related[0].answers) : null;
    const averageScore =
      related.length === 0
        ? 0
        : Math.round(
            related.reduce((acc, response) => acc + scoreQuestionnaire(questionnaire, response.answers).score, 0) /
              related.length,
          );

    return {
      ...questionnaire,
      relatedCount: related.length,
      averageScore,
      latestBand: latest?.band ?? 'Sem dados',
      latestCompletionRate: latest?.completionRate ?? 0,
    };
  });
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
  const rows = buildSummaries(questionnaires, responses).map((item) => [
    item.title,
    item.relatedCount,
    item.averageScore,
    item.latestBand,
    item.latestCompletionRate,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(';'))
    .join('\n');

  triggerDownload(`forms-questionnaires-${timestamp()}.csv`, csv, 'text/csv;charset=utf-8');
}

export async function exportReportPdf(questionnaires, responses) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const autoTable = autoTableModule.default ?? autoTableModule.autoTable ?? autoTableModule;
  const summaries = buildSummaries(questionnaires, responses);
  const recentResponses = responses.slice(0, 12);
  const doc = new jsPDF();
  const generatedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());

  doc.setFillColor(15, 27, 43);
  doc.rect(0, 0, 210, 42, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Forms Platform', 14, 16);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório executivo da operação', 14, 23);
  doc.text(`Gerado em ${generatedAt}`, 14, 29);
  doc.text(`Questionários: ${questionnaires.length}`, 14, 35);
  doc.text(`Respostas: ${responses.length}`, 75, 35);

  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Desempenho por questionário', 14, 52);

  autoTable(doc, {
    startY: 56,
    head: [['Questionário', 'Respostas', 'Média', 'Última faixa', 'Conclusão']],
    body: summaries.map((item) => [
      item.title,
      String(item.relatedCount),
      String(item.averageScore),
      item.latestBand,
      `${item.latestCompletionRate}%`,
    ]),
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [31, 41, 55],
    },
  });

  const responsesStartY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 12 : 90;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Respostas recentes', 14, responsesStartY);

  autoTable(doc, {
    startY: responsesStartY + 4,
    head: [['Questionário', 'Respondente', 'Pontos', 'Faixa', 'Data']],
    body: recentResponses.map((response) => {
      const questionnaire = questionnaires.find((item) => item.id === response.questionnaireId);
      return [
        questionnaire?.title ?? response.questionnaireId,
        response.respondentName || 'Sem nome',
        String(response.score ?? ''),
        response.band ?? 'Sem faixa',
        response.createdAt ?? '',
      ];
    }),
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [31, 41, 55],
    },
  });

  doc.save(`forms-relatorio-${timestamp()}.pdf`);
}
