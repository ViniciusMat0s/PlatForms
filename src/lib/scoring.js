export function getScaleRange(scale) {
  const maxIndex = Math.max((scale?.labels?.length ?? scale?.values?.length ?? 0) - 1, 1);
  return {
    min: 0,
    max: maxIndex,
    span: Math.max(maxIndex, 1),
  };
}

export function normalizeAnswer(answer, scale, reversed = false) {
  if (typeof answer !== 'number') return null;

  const { min, max, span } = getScaleRange(scale);
  const clamped = Math.max(min, Math.min(max, answer));
  const effective = reversed ? max - (clamped - min) : clamped;
  return ((effective - min) / span) * 100;
}

export function isReverseQuestion(questionnaire, question) {
  const reverseQuestionIds = new Set(questionnaire.scoring?.reverseQuestions ?? []);
  return Boolean(question.reverse || reverseQuestionIds.has(question.id) || questionnaire.scale?.reversed);
}

export function scoreQuestion(questionnaire, question, answer) {
  const reversed = isReverseQuestion(questionnaire, question);
  const score = normalizeAnswer(answer, questionnaire.scale, reversed);

  if (score === null) {
    return null;
  }

  return {
    questionId: question.id,
    dimension: question.dimension ?? 'geral',
    reversed,
    rawAnswer: answer,
    score: Number(score.toFixed(1)),
  };
}

export function scoreQuestionnaire(questionnaire, answers) {
  const items = questionnaire.questions ?? [];
  const scoredItems = items
    .map((question) => scoreQuestion(questionnaire, question, answers[question.id]))
    .filter(Boolean);

  const answered = scoredItems.length;
  const total = items.length;

  if (answered === 0) {
    return {
      answered: 0,
      total,
      completionRate: 0,
      average: 0,
      score: 0,
      band: 'Sem respostas',
      dimensions: [],
      items: [],
    };
  }

  const sum = scoredItems.reduce((acc, item) => acc + item.score, 0);
  const average = sum / answered;
  const score = Math.round(average);
  const band = getBand(questionnaire.bands, score);

  const dimensionMap = scoredItems.reduce((acc, item) => {
    const key = item.dimension || 'geral';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item.score);
    return acc;
  }, {});

  const dimensions = Object.entries(dimensionMap)
    .map(([dimension, values]) => {
      const dimensionAverage = values.reduce((acc, value) => acc + value, 0) / values.length;
      return {
        dimension,
        score: Math.round(dimensionAverage),
        average: Number(dimensionAverage.toFixed(1)),
        answered: values.length,
      };
    })
    .sort((a, b) => a.dimension.localeCompare(b.dimension));

  return {
    answered,
    total,
    completionRate: Math.round((answered / total) * 100),
    average: Number(average.toFixed(1)),
    score,
    band,
    dimensions,
    items: scoredItems,
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
