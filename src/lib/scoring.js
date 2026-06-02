export function normalizeAnswer(answer, scale) {
  if (typeof answer !== 'number') return null;
  const max = Math.max(scale.values?.length ? scale.values.length - 1 : 0, 1);
  return (answer / max) * 100;
}

export function scoreQuestionnaire(questionnaire, answers) {
  const items = questionnaire.questions ?? [];
  const filled = items.filter((question) => typeof answers[question.id] === 'number');

  if (filled.length === 0) {
    return {
      answered: 0,
      total: items.length,
      average: 0,
      score: 0,
      band: 'Sem respostas',
    };
  }

  const sum = filled.reduce((acc, question) => {
    const value = answers[question.id];
    return acc + normalizeAnswer(value, questionnaire.scale);
  }, 0);

  const average = sum / filled.length;
  const score = Math.round(average);
  const band = getBand(questionnaire.bands, score);

  return {
    answered: filled.length,
    total: items.length,
    average: Number(average.toFixed(1)),
    score,
    band,
  };
}

function getBand(bands, score) {
  if (!Array.isArray(bands) || bands.length === 0) {
    if (score < 35) return 'Baixo';
    if (score < 65) return 'Moderado';
    return 'Alto';
  }

  const match = bands.find((band) => score >= band.min && score <= band.max);
  return match?.label ?? bands[bands.length - 1].label;
}

export function createQuestionnaireId(title) {
  const normalized = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return normalized || `questionario-${Date.now()}`;
}
